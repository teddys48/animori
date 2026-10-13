/**
 * Anime service — the single centralized module UI components call for anime data.
 *
 *   Svelte pages → anime service (this file) → Kitsu client → Kitsu JSON:API
 *
 * Normalizes raw Kitsu JSON:API payloads into the application `AnimeItem` model
 * and handles pagination (limit/offset to 1-based page numbers).
 */
import { kitsu } from './kitsu';
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
  Paginated
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

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

export function resolvePoster(attributes: KitsuAnimeAttributes): string {
  const images = attributes.posterImage;
  if (!images) return FALLBACK_POSTER;
  return (
    images.medium ||
    images.large ||
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

  // Extract genres if available from includedMap
  const genres: string[] = [];
  if (includedMap && resource.relationships?.genres?.data) {
    const relData = resource.relationships.genres.data;
    const genreIds = Array.isArray(relData) ? relData : [relData];
    for (const g of genreIds) {
      const match = includedMap.get(`genres:${g.id}`);
      if (match?.attributes?.name) genres.push(match.attributes.name);
    }
  }

  // Canonical web link
  const slug = attr.slug || resource.id;
  const url = `https://kitsu.app/anime/${slug}`;

  // Clean synopsis
  let synopsis = (attr.synopsis || attr.description || '')
    .replace(/\s*\[Written by MAL Rewrite\]\s*$/i, '')
    .trim();

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
    airedShort: resolveAiredShort(attr),
    duration: attr.episodeLength ? `${attr.episodeLength} min` : null,
    synopsis: synopsis || undefined,
    ageRating: attr.ageRating || null,
    ageRatingGuide: attr.ageRatingGuide || null,
    genres,
    studios: [],
    url
  };
}

function uniqueById(items: AnimeItem[]): AnimeItem[] {
  const seen = new Set<string | number>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}

function buildIncludedMap(included?: KitsuIncludedResource[]): Map<string, KitsuIncludedResource> {
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

/** Get single anime details by ID from Kitsu */
export async function getAnime(id: string | number): Promise<AnimeItem> {
  const res = await kitsu.getAnime(id);
  return mapKitsuAnime(res);
}

/** Helper to derive a representative season label from anime items */
export function seasonLabel(items: AnimeItem[]): string | undefined {
  const currentYear = new Date().getFullYear();
  return `Broadcast Season ${currentYear}`;
}
