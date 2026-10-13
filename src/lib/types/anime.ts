/**
 * Application-level anime model consumed by UI components.
 * Mapped from raw Kitsu JSON:API payloads in `src/lib/api/anime.ts`.
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
  id: string | number;
  name: string;
}

export interface AnimeAired {
  from: string | null;
  to: string | null;
  /** Human readable range e.g. "Sep 29, 2023 to Mar 22, 2024". */
  label: string | null;
}

export interface VoiceActor {
  id: string;
  name: string;
  image?: string;
  language?: string;
  locale?: string;
}

export interface CharacterItem {
  id: string;
  name: string;
  nameJapanese?: string;
  image?: string;
  role: 'Main' | 'Supporting' | string;
  voiceActors: VoiceActor[];
}

export interface RelatedAnimeItem {
  id: string;
  role: string;
  roleRaw: string;
  destinationType: string;
  title: string;
  poster: string;
  type?: AnimeType;
  year?: number | null;
  score?: number | null;
}

export interface AnimeItem {
  id: string | number;
  title: string;
  titleEnglish?: string;
  titleJapanese?: string;
  /** Best available poster URL (always set; falls back to a local placeholder). */
  poster: string;
  /** Optional wide banner image. */
  banner?: string;
  type?: AnimeType;
  episodes?: number | null;
  /** Normalized rating score (0–10 scale). `null` when not yet scored. */
  score: number | null;
  /** Raw average rating percentage string from Kitsu (e.g. "82.27%"). */
  scoreRaw?: string | null;
  scoredBy?: number | null;
  rank?: number | null;
  popularity?: number | null;
  members?: number | null;
  year?: number | null;
  season?: AnimeSeason;
  status?: AnimeStatus;
  aired?: AnimeAired;
  /** Short aired label for compact UI, e.g. "Oct 1999". */
  airedShort?: string;
  airingDate?: string;
  duration?: string | null;
  episodeLength?: number | null;
  totalLength?: number | null;
  synopsis?: string;
  ageRating?: string | null;
  ageRatingGuide?: string | null;
  genres: string[];
  categories?: string[];
  studios?: string[];
  /** Canonical Kitsu web page URL. */
  url?: string;
  youtubeVideoId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  favoritesCount?: number | null;
}

/** Normalized pagination metadata. */
export interface PageInfo {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  total?: number;
  perPage?: number;
  offset?: number;
}

export interface Paginated<T> {
  items: T[];
  pageInfo: PageInfo;
}
