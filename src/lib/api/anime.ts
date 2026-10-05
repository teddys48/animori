/**
 * Anime service — the only module UI pages should call for anime data.
 *
 *   Svelte page → anime service (this file) → Jikan client → Jikan API
 *
 * Maps raw Jikan payloads into the application `AnimeItem` model and
 * normalizes pagination metadata.
 */
import { jikan } from './jikan';
import type { JikanAnime, JikanListResponse, JikanTopFilter, JikanTopType } from './types';
import type {
  AnimeItem,
  AnimeSeason,
  AnimeStatus,
  AnimeType,
  Paginated
} from '../types/anime';

/** Items per page. 24 divides evenly into 2/3/4/6-column grids. Jikan max is 25. */
export const PAGE_SIZE = 24;

/** Local placeholder used when Jikan provides no usable poster. */
export const FALLBACK_POSTER = '/fallback-poster.png';

/* ------------------------------------------------------------------ */
/* Mapping                                                             */
/* ------------------------------------------------------------------ */

const ANIME_TYPES: readonly AnimeType[] = [
  'TV', 'Movie', 'OVA', 'ONA', 'Special', 'TV Special', 'Music', 'CM', 'PV'
];
const ANIME_STATUSES: readonly AnimeStatus[] = ['Currently Airing', 'Finished Airing', 'Not yet aired'];
const SEASONS: Record<string, AnimeSeason> = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall'
};

function oneOf<T extends string>(value: string | null | undefined, allowed: readonly T[]): T | undefined {
  return allowed.find((v) => v === value);
}

/** MAL serves a generic icon when an anime has no artwork; treat it as missing. */
function usableImage(url: string | null | undefined): string | undefined {
  if (!url || url.includes('/img/sp/icon/') || url.includes('questionmark')) return undefined;
  return url;
}

export function resolvePoster(anime: Pick<JikanAnime, 'images'>): string {
  const { webp, jpg } = anime.images ?? {};
  return (
    usableImage(webp?.large_image_url) ??
    usableImage(jpg?.large_image_url) ??
    usableImage(webp?.image_url) ??
    FALLBACK_POSTER
  );
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function shortAired(anime: JikanAnime): string | undefined {
  const prop = anime.aired?.prop?.from;
  if (prop?.year) {
    if (prop.month) return monthFormatter.format(Date.UTC(prop.year, prop.month - 1, 1));
    return String(prop.year);
  }
  if (anime.season && anime.year) return `${SEASONS[anime.season] ?? anime.season} ${anime.year}`;
  return anime.year ? String(anime.year) : undefined;
}

export function mapAnime(raw: JikanAnime): AnimeItem {
  const airedLabel = raw.aired?.string && raw.aired.string !== 'Not available' ? raw.aired.string : null;

  return {
    id: raw.mal_id,
    title: raw.title,
    titleEnglish: raw.title_english ?? undefined,
    titleJapanese: raw.title_japanese ?? undefined,
    poster: resolvePoster(raw),
    type: oneOf(raw.type, ANIME_TYPES),
    episodes: raw.episodes ?? null,
    score: typeof raw.score === 'number' && raw.score > 0 ? raw.score : null,
    scoredBy: raw.scored_by,
    rank: raw.rank,
    popularity: raw.popularity,
    members: raw.members,
    year: raw.year ?? raw.aired?.prop?.from.year ?? null,
    season: raw.season ? SEASONS[raw.season] : undefined,
    status: oneOf(raw.status, ANIME_STATUSES),
    aired: raw.aired ? { from: raw.aired.from, to: raw.aired.to, label: airedLabel } : undefined,
    airedShort: shortAired(raw),
    duration: raw.duration,
    synopsis: raw.synopsis?.replace(/\s*\[Written by MAL Rewrite\]\s*$/i, '').trim() || undefined,
    genres: (raw.genres ?? []).map((g) => g.name),
    studios: (raw.studios ?? []).map((s) => s.name),
    url: raw.url
  };
}

/** Jikan occasionally returns the same entry twice on a page; keyed lists need unique ids. */
function uniqueById(items: AnimeItem[]): AnimeItem[] {
  const seen = new Set<number>();
  return items.filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)));
}

function toPaginated(res: JikanListResponse<JikanAnime>, requestedPage: number): Paginated<AnimeItem> {
  const { pagination } = res;
  return {
    items: uniqueById(res.data.map(mapAnime)),
    pageInfo: {
      currentPage: pagination.current_page ?? requestedPage,
      lastPage: Math.max(1, pagination.last_visible_page),
      hasNextPage: pagination.has_next_page,
      total: pagination.items?.total,
      perPage: pagination.items?.per_page
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
  filter?: JikanTopFilter;
  type?: JikanTopType;
}

/** Add new categories here — the Top page renders tabs from this list. */
export const TOP_CATEGORIES: readonly TopCategory[] = [
  { id: 'all', label: 'All Anime', description: 'Highest rated anime of all time on MyAnimeList' },
  { id: 'airing', label: 'Top Airing', description: 'Best rated anime currently broadcasting', filter: 'airing' },
  { id: 'upcoming', label: 'Top Upcoming', description: 'Most anticipated upcoming anime', filter: 'upcoming' },
  { id: 'tv', label: 'Top TV', description: 'Highest rated TV series', type: 'tv' },
  { id: 'movie', label: 'Top Movies', description: 'Highest rated anime films', type: 'movie' },
  { id: 'popular', label: 'Most Popular', description: 'Anime with the most MyAnimeList members', filter: 'bypopularity' }
];

export function getTopCategory(id: string | null | undefined): TopCategory {
  return TOP_CATEGORIES.find((c) => c.id === id) ?? TOP_CATEGORIES[0];
}

/* ------------------------------------------------------------------ */
/* Public service API                                                  */
/* ------------------------------------------------------------------ */

export async function searchAnime(query: string, page = 1): Promise<Paginated<AnimeItem>> {
  const res = await jikan.searchAnime({ q: query.trim(), page, limit: PAGE_SIZE });
  return toPaginated(res, page);
}

export async function getTopAnime(category: TopCategory = TOP_CATEGORIES[0], page = 1): Promise<Paginated<AnimeItem>> {
  const res = await jikan.getTopAnime({ filter: category.filter, type: category.type, page, limit: PAGE_SIZE });
  return toPaginated(res, page);
}

export async function getSeasonNow(page = 1): Promise<Paginated<AnimeItem>> {
  const res = await jikan.getSeasonNow({ page, limit: PAGE_SIZE });
  return toPaginated(res, page);
}

export async function getUpcomingAnime(page = 1): Promise<Paginated<AnimeItem>> {
  const res = await jikan.getSeasonUpcoming({ page, limit: PAGE_SIZE });
  return toPaginated(res, page);
}

/** Derive the current season label (e.g. "Fall 2026") from Jikan data rather than the local clock. */
export function seasonLabel(items: AnimeItem[]): string | undefined {
  const counts = new Map<string, number>();
  for (const item of items) {
    if (!item.season || !item.year) continue;
    const key = `${item.season} ${item.year}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      best = key;
      bestCount = count;
    }
  }
  return best;
}
