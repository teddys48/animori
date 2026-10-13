/**
 * Anime service — the single centralized module UI components call for anime data.
 *
 *   Svelte pages → anime service (this file) → Kitsu client → Kitsu JSON:API
 *
 * Normalizes raw Kitsu JSON:API payloads into the application `AnimeItem` model
 * and handles pagination (limit/offset to 1-based page numbers).
 */
import { kitsu } from './kitsu';
import { KitsuError } from './errors';
import type {
  KitsuAnimeAttributes,
  KitsuAnimeResource,
  KitsuIncludedResource,
  KitsuListResponse
} from './types';
import type {
  AnimeItem,
  AnimeSeason,
  AnimeStatus,
  AnimeType,
  CharacterItem,
  Paginated,
  RelatedAnimeItem,
  VoiceActor
} from '../types/anime';

/**
 * Items per page. Kitsu's documented maximum page size is 20.
 * 20 evenly divides into responsive 2, 4, and 5-column grids.
 */
export const PAGE_SIZE = 20;

/** Local fallback placeholder used when an anime has no poster artwork. */
export const FALLBACK_POSTER = '/fallback-poster.png';

/* ------------------------------------------------------------------ */
/* Mapping helpers                                                    */
/* ------------------------------------------------------------------ */

const SUBTYPE_MAP: Record<string, AnimeType> = {
  tv: 'TV',
  TV: 'TV',
  movie: 'Movie',
  Movie: 'Movie',
  ova: 'OVA',
  OVA: 'OVA',
  ona: 'ONA',
  ONA: 'ONA',
  special: 'Special',
  Special: 'Special',
  tv_special: 'TV Special',
  music: 'Music',
  Music: 'Music'
};

const STATUS_MAP: Record<string, AnimeStatus> = {
  current: 'Currently Airing',
  finished: 'Finished Airing',
  upcoming: 'Not yet aired',
  tba: 'Not yet aired',
  unapproved: 'Not yet aired'
};

const ROLE_MAP: Record<string, string> = {
  sequel: 'Sequel',
  prequel: 'Prequel',
  side_story: 'Side Story',
  parent_story: 'Parent Story',
  summary: 'Summary',
  full_story: 'Full Story',
  alternative_version: 'Alternative Version',
  alternative_setting: 'Alternative Setting',
  spinoff: 'Spin-Off',
  adaptation: 'Adaptation',
  other: 'Other'
};

const LOCALE_MAP: Record<string, string> = {
  ja_jp: 'Japanese',
  ja: 'Japanese',
  en: 'English',
  en_us: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  pt_br: 'Portuguese (BR)',
  ko: 'Korean',
  zh: 'Chinese',
  ru: 'Russian',
  hu: 'Hungarian'
};

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

const fullDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
});

export function formatDateString(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parts.length > 1 ? parseInt(parts[1], 10) : 1;
    const day = parts.length > 2 ? parseInt(parts[2], 10) : 1;
    if (year) {
      return fullDateFormatter.format(Date.UTC(year, month - 1, day));
    }
  } catch {
    // Return original string if formatting fails
  }
  return dateStr;
}

export function formatRelationshipRole(raw?: string | null): string {
  if (!raw) return 'Related';
  const clean = raw.toLowerCase().trim();
  return ROLE_MAP[clean] || raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatLocale(code?: string | null): string {
  if (!code) return 'Unknown';
  const clean = code.toLowerCase().replace('-', '_');
  return LOCALE_MAP[clean] || code.toUpperCase();
}

export function resolvePoster(attributes: KitsuAnimeAttributes): string {
  const images = attributes.posterImage;
  if (!images) return FALLBACK_POSTER;
  return (
    images.large ||
    images.medium ||
    images.small ||
    images.original ||
    images.tiny ||
    FALLBACK_POSTER
  );
}

export function resolveBanner(attributes: KitsuAnimeAttributes): string | undefined {
  const cover = attributes.coverImage;
  if (!cover) return undefined;
  return cover.large || cover.original || cover.small || cover.tiny || undefined;
}

export function resolveScore(rawRating: string | null | undefined): {
  score: number | null;
  scoreRaw: string | null;
} {
  if (!rawRating) return { score: null, scoreRaw: null };
  const num = parseFloat(rawRating);
  if (!Number.isFinite(num) || num <= 0) return { score: null, scoreRaw: null };
  // Convert 0–100 percentage to 0–10 standard MAL-style score rounded to 1 decimal place
  const score = Math.round(num) / 10;
  return { score, scoreRaw: `${rawRating}%` };
}

export function resolveAiredShort(attributes: KitsuAnimeAttributes): string | undefined {
  const start = attributes.startDate;
  if (!start) return undefined;
  try {
    const parts = start.split('-');
    const year = parseInt(parts[0], 10);
    const month = parts.length > 1 ? parseInt(parts[1], 10) : null;
    if (year && month) {
      return monthFormatter.format(Date.UTC(year, month - 1, 1));
    }
    if (year) return String(year);
  } catch {
    // Ignore date parse failures
  }
  return undefined;
}

export function resolveYear(attributes: KitsuAnimeAttributes): number | null {
  const start = attributes.startDate;
  if (!start) return null;
  const year = parseInt(start.substring(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export function mapKitsuAnime(
  resource: KitsuAnimeResource,
  includedMap?: Map<string, KitsuIncludedResource>
): AnimeItem {
  const attr = resource.attributes ?? {};
  const { score, scoreRaw } = resolveScore(attr.averageRating);

  // Extract titles
  const titles = attr.titles ?? {};
  const canonicalTitle = attr.canonicalTitle || titles.en || titles.en_jp || 'Unknown Title';
  const titleEnglish = titles.en;
  const titleJapanese = titles.ja_jp;

  // Extract subtype & status
  const type = attr.subtype ? SUBTYPE_MAP[attr.subtype] : undefined;
  const status = attr.status ? STATUS_MAP[attr.status] : undefined;

  // Extract genres & categories if available from includedMap
  const genres: string[] = [];
  const categories: string[] = [];
  if (includedMap) {
    if (resource.relationships?.genres?.data) {
      const relData = resource.relationships.genres.data;
      const genreIds = Array.isArray(relData) ? relData : [relData];
      for (const g of genreIds) {
        const match = includedMap.get(`genres:${g.id}`);
        if (match?.attributes?.name && !genres.includes(match.attributes.name)) {
          genres.push(match.attributes.name);
        }
      }
    }

    if (resource.relationships?.categories?.data) {
      const relData = resource.relationships.categories.data;
      const catIds = Array.isArray(relData) ? relData : [relData];
      for (const c of catIds) {
        const match = includedMap.get(`categories:${c.id}`);
        const title = match?.attributes?.title || match?.attributes?.name;
        if (title && !categories.includes(title)) {
          categories.push(title);
        }
      }
    }
  }

  // Canonical web link
  const slug = attr.slug || resource.id;
  const url = `https://kitsu.app/anime/${slug}`;

  // Clean synopsis
  let synopsis = (attr.synopsis || attr.description || '')
    .replace(/\s*\[Written by MAL Rewrite\]\s*$/i, '')
    .trim();

  // Aired range label
  const startDateFormatted = formatDateString(attr.startDate);
  const endDateFormatted = formatDateString(attr.endDate);
  let airedLabel: string | null = null;
  if (startDateFormatted && endDateFormatted) {
    airedLabel = `${startDateFormatted} to ${endDateFormatted}`;
  } else if (startDateFormatted) {
    airedLabel = `${startDateFormatted}`;
  }

  return {
    id: resource.id,
    title: canonicalTitle,
    titleEnglish: titleEnglish || undefined,
    titleJapanese: titleJapanese || undefined,
    poster: resolvePoster(attr),
    banner: resolveBanner(attr),
    type,
    episodes: typeof attr.episodeCount === 'number' ? attr.episodeCount : null,
    score,
    scoreRaw,
    scoredBy: null,
    rank: attr.ratingRank ?? null,
    popularity: attr.popularityRank ?? null,
    members: attr.userCount ?? null,
    year: resolveYear(attr),
    status,
    aired: {
      from: attr.startDate || null,
      to: attr.endDate || null,
      label: airedLabel
    },
    airedShort: resolveAiredShort(attr),
    duration: attr.episodeLength ? `${attr.episodeLength} min` : null,
    episodeLength: attr.episodeLength ?? null,
    totalLength: attr.totalLength ?? null,
    synopsis: synopsis || undefined,
    ageRating: attr.ageRating || null,
    ageRatingGuide: attr.ageRatingGuide || null,
    genres,
    categories,
    studios: [],
    url,
    youtubeVideoId: attr.youtubeVideoId || null,
    startDate: startDateFormatted,
    endDate: endDateFormatted,
    favoritesCount: attr.favoritesCount ?? null
  };
}

function uniqueById(items: AnimeItem[]): AnimeItem[] {
  const seen = new Set<string | number>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}

export function buildIncludedMap(included?: KitsuIncludedResource[]): Map<string, KitsuIncludedResource> {
  const map = new Map<string, KitsuIncludedResource>();
  if (!included) return map;
  for (const item of included) {
    map.set(`${item.type}:${item.id}`, item);
  }
  return map;
}

function toPaginated(
  res: KitsuListResponse<KitsuAnimeResource>,
  requestedPage: number,
  limit = PAGE_SIZE
): Paginated<AnimeItem> {
  const incMap = buildIncludedMap(res.included);
  const items = uniqueById(res.data.map((item) => mapKitsuAnime(item, incMap)));

  const total = typeof res.meta?.count === 'number' ? res.meta.count : items.length;
  const lastPage = total > 0 ? Math.ceil(total / limit) : Math.max(1, requestedPage);
  const offset = (requestedPage - 1) * limit;
  const hasNextPage = offset + items.length < total;

  return {
    items,
    pageInfo: {
      currentPage: requestedPage,
      lastPage,
      hasNextPage,
      total,
      perPage: limit,
      offset
    }
  };
}

/* ------------------------------------------------------------------ */
/* Top anime categories                                                */
/* ------------------------------------------------------------------ */

export interface TopCategory {
  id: string;
  label: string;
  description: string;
  filter?: Record<string, any>;
  sort?: string;
}

export const TOP_CATEGORIES: readonly TopCategory[] = [
  {
    id: 'all',
    label: 'All Anime',
    description: 'Highest rated anime of all time on Kitsu',
    sort: '-averageRating'
  },
  {
    id: 'airing',
    label: 'Top Airing',
    description: 'Best rated anime currently broadcasting',
    filter: { status: 'current' },
    sort: '-averageRating'
  },
  {
    id: 'upcoming',
    label: 'Top Upcoming',
    description: 'Most anticipated upcoming anime releases',
    filter: { status: 'upcoming' },
    sort: '-userCount'
  },
  {
    id: 'tv',
    label: 'Top TV',
    description: 'Highest rated TV series on Kitsu',
    filter: { subtype: 'TV' },
    sort: '-averageRating'
  },
  {
    id: 'movie',
    label: 'Top Movies',
    description: 'Highest rated anime films on Kitsu',
    filter: { subtype: 'movie' },
    sort: '-averageRating'
  },
  {
    id: 'popular',
    label: 'Most Popular',
    description: 'Anime with the most members on Kitsu',
    sort: '-userCount'
  }
];

export function getTopCategory(id: string | null | undefined): TopCategory {
  return TOP_CATEGORIES.find((c) => c.id === id) ?? TOP_CATEGORIES[0];
}

/* ------------------------------------------------------------------ */
/* Public service API                                                  */
/* ------------------------------------------------------------------ */

/** Search anime by title using filter[text] */
export async function searchAnime(query: string, page = 1): Promise<Paginated<AnimeItem>> {
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);
  const res = await kitsu.searchAnime({ text: query.trim(), limit: PAGE_SIZE, offset });
  return toPaginated(res, page, PAGE_SIZE);
}

/** Get top / curated ranking anime by category and page */
export async function getTopAnime(
  category: TopCategory = TOP_CATEGORIES[0],
  page = 1
): Promise<Paginated<AnimeItem>> {
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);
  const res = await kitsu.listAnime({
    filter: category.filter,
    sort: category.sort ?? '-averageRating',
    limit: PAGE_SIZE,
    offset
  });
  return toPaginated(res, page, PAGE_SIZE);
}

/** Get official trending anime from Kitsu (/trending/anime) */
export async function getTrendingAnime(limit = 10): Promise<AnimeItem[]> {
  const res = await kitsu.getTrendingAnime(limit);
  const incMap = buildIncludedMap(res.included);
  return uniqueById(res.data.map((item) => mapKitsuAnime(item, incMap)));
}

/** Get currently airing anime from Kitsu */
export async function getSeasonNow(page = 1): Promise<Paginated<AnimeItem>> {
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);
  const res = await kitsu.listAnime({
    filter: { status: 'current' },
    sort: '-userCount',
    limit: PAGE_SIZE,
    offset
  });
  return toPaginated(res, page, PAGE_SIZE);
}

/** Get upcoming anime from Kitsu */
export async function getUpcomingAnime(page = 1): Promise<Paginated<AnimeItem>> {
  const offset = Math.max(0, (page - 1) * PAGE_SIZE);
  const res = await kitsu.listAnime({
    filter: { status: 'upcoming' },
    sort: '-userCount',
    limit: PAGE_SIZE,
    offset
  });
  return toPaginated(res, page, PAGE_SIZE);
}

/**
 * Validate anime resource ID. Must be positive integer.
 */
export function validateAnimeId(id: string | number): number {
  const parsed = typeof id === 'number' ? id : parseInt(String(id).trim(), 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || !/^\d+$/.test(String(id).trim())) {
    throw new KitsuError('bad-request', `Invalid anime ID "${id}". ID must be a positive integer.`);
  }
  return parsed;
}

/** Get single anime details by ID from Kitsu, with included genres and categories */
export async function getAnime(id: string | number): Promise<AnimeItem> {
  const validId = validateAnimeId(id);
  const res = await kitsu.getAnime(validId, 'genres,categories');
  const incMap = buildIncludedMap(res.included);
  return mapKitsuAnime(res.data, incMap);
}

/** Get characters and voice actors for an anime */
export async function getAnimeCharacters(
  id: string | number,
  limit = 12
): Promise<CharacterItem[]> {
  const validId = validateAnimeId(id);
  const res = await kitsu.getAnimeCharacters(validId, limit);
  const incMap = buildIncludedMap(res.included);

  const characters: CharacterItem[] = [];

  for (const mediaChar of res.data) {
    const charRel = mediaChar.relationships?.character?.data;
    if (!charRel || Array.isArray(charRel)) continue;

    const charResource = incMap.get(`characters:${charRel.id}`);
    if (!charResource) continue;

    const roleRaw = mediaChar.attributes?.role ?? 'supporting';
    const role = roleRaw.toLowerCase() === 'main' ? 'Main' : 'Supporting';

    const charAttr = charResource.attributes ?? {};
    const name = charAttr.canonicalName || charAttr.names?.en || 'Unknown Character';
    const nameJapanese = charAttr.names?.ja_jp || undefined;

    // Resolve best character image
    const charImgObj = charAttr.image;
    let charImage: string | undefined;
    if (charImgObj) {
      charImage =
        charImgObj.medium ||
        charImgObj.large ||
        charImgObj.original ||
        charImgObj.small ||
        undefined;
    }

    // Resolve voice actors from characterVoices relationship
    const voiceActors: VoiceActor[] = [];
    const voicesRel = mediaChar.relationships?.voices?.data;
    const voiceEntries = Array.isArray(voicesRel) ? voicesRel : voicesRel ? [voicesRel] : [];

    for (const vRel of voiceEntries) {
      const voiceRes = incMap.get(`characterVoices:${vRel.id}`);
      if (!voiceRes) continue;

      const personRel = voiceRes.relationships?.person?.data;
      if (!personRel || Array.isArray(personRel)) continue;

      const personRes = incMap.get(`people:${personRel.id}`);
      if (!personRes) continue;

      const personAttr = personRes.attributes ?? {};
      const personName = personAttr.name || 'Unknown Voice Actor';
      const rawLocale = voiceRes.attributes?.locale;
      const language = formatLocale(rawLocale);

      const personImgObj = personAttr.image;
      let personImage: string | undefined;
      if (personImgObj) {
        personImage =
          personImgObj.medium ||
          personImgObj.large ||
          personImgObj.original ||
          personImgObj.small ||
          undefined;
      }

      voiceActors.push({
        id: personRes.id,
        name: personName,
        image: personImage,
        language,
        locale: rawLocale
      });
    }

    // Sort voice actors: Japanese first, then English, then others
    voiceActors.sort((a, b) => {
      const isAJa = a.locale?.startsWith('ja') ? 1 : 0;
      const isBJa = b.locale?.startsWith('ja') ? 1 : 0;
      if (isAJa !== isBJa) return isBJa - isAJa;

      const isAEn = a.locale?.startsWith('en') ? 1 : 0;
      const isBEn = b.locale?.startsWith('en') ? 1 : 0;
      if (isAEn !== isBEn) return isBEn - isAEn;

      return a.name.localeCompare(b.name);
    });

    characters.push({
      id: charResource.id,
      name,
      nameJapanese,
      image: charImage,
      role,
      voiceActors
    });
  }

  return characters;
}

/** Get related anime from Kitsu media-relationships */
export async function getAnimeRelated(
  id: string | number,
  limit = 20
): Promise<RelatedAnimeItem[]> {
  const validId = validateAnimeId(id);
  const res = await kitsu.getAnimeMediaRelationships(validId, limit);
  const incMap = buildIncludedMap(res.included);

  const related: RelatedAnimeItem[] = [];

  for (const relItem of res.data) {
    const destRel = relItem.relationships?.destination?.data;
    if (!destRel || Array.isArray(destRel)) continue;

    // We only display anime destination items since they have an anime detail route
    if (destRel.type !== 'anime') continue;

    const destAnimeRes = incMap.get(`anime:${destRel.id}`) as KitsuAnimeResource | undefined;
    if (!destAnimeRes) continue;

    const destAttr = destAnimeRes.attributes ?? {};
    const title = destAttr.canonicalTitle || destAttr.titles?.en || 'Unknown Anime';
    const roleRaw = relItem.attributes?.role ?? 'other';
    const role = formatRelationshipRole(roleRaw);

    const type = destAttr.subtype ? SUBTYPE_MAP[destAttr.subtype] : undefined;
    const year = resolveYear(destAttr);
    const { score } = resolveScore(destAttr.averageRating);

    related.push({
      id: destAnimeRes.id,
      role,
      roleRaw,
      destinationType: 'anime',
      title,
      poster: resolvePoster(destAttr),
      type,
      year,
      score
    });
  }

  return related;
}

/** Get more anime to explore based on category, excluding current anime */
export async function getMoreAnimeToExplore(
  category: string,
  excludeId?: string | number,
  limit = 6
): Promise<AnimeItem[]> {
  if (!category || !category.trim()) return [];
  const res = await kitsu.listAnime({
    filter: { categories: category.trim() },
    sort: '-userCount',
    limit: limit + 2
  });
  const incMap = buildIncludedMap(res.included);
  const currentIdStr = excludeId ? String(excludeId) : null;

  return res.data
    .filter((item) => String(item.id) !== currentIdStr)
    .slice(0, limit)
    .map((item) => mapKitsuAnime(item, incMap));
}

/** Helper to derive a representative season label from anime items */
export function seasonLabel(items: AnimeItem[]): string | undefined {
  const currentYear = new Date().getFullYear();
  return `Broadcast Season ${currentYear}`;
}
