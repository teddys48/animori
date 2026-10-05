/**
 * Application-level anime model consumed by UI components.
 * Mapped from raw Jikan payloads in `src/lib/api/anime.ts`.
 */

export type AnimeType =
  | 'TV'
  | 'Movie'
  | 'OVA'
  | 'ONA'
  | 'Special'
  | 'TV Special'
  | 'Music'
  | 'CM'
  | 'PV';

export type AnimeStatus = 'Currently Airing' | 'Finished Airing' | 'Not yet aired';

export type AnimeSeason = 'Winter' | 'Spring' | 'Summer' | 'Fall';

export interface AnimeGenre {
  id: number;
  name: string;
}

export interface AnimeAired {
  from: string | null;
  to: string | null;
  /** Human readable range from Jikan, e.g. "Sep 29, 2023 to Mar 22, 2024". */
  label: string | null;
}

export interface AnimeItem {
  id: number;
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  /** Best available poster URL (always set; falls back to a local placeholder). */
  poster: string;
  /** Optional wide banner image (not provided by Jikan list endpoints). */
  banner?: string;
  type?: AnimeType;
  episodes?: number | null;
  /** MAL score (0–10). `null` when not yet scored. */
  score: number | null;
  scoredBy?: number | null;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  year?: number | null;
  season?: AnimeSeason;
  status?: AnimeStatus;
  aired?: AnimeAired;
  /** Short aired label for compact UI, e.g. "Jan 2027". */
  airedShort?: string;
  airingDate?: string;
  duration?: string | null;
  synopsis?: string;
  genres: string[];
  studios?: string[];
  /** Canonical MyAnimeList URL. */
  url?: string;
}

/** Normalized pagination metadata. */
export interface PageInfo {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  total?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  pageInfo: PageInfo;
}
