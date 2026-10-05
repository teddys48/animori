/**
 * Focused TypeScript models for the subset of the Jikan v4 API that Animori uses.
 * See https://docs.api.jikan.moe/ for the full schema.
 *
 * These are *raw* API shapes. UI components should consume the mapped
 * application model (`AnimeItem`) from `src/lib/types/anime.ts` instead.
 */

export interface JikanImageVariant {
  image_url: string | null;
  small_image_url?: string | null;
  large_image_url?: string | null;
}

export interface JikanImages {
  jpg?: JikanImageVariant;
  webp?: JikanImageVariant;
}

export interface JikanTitle {
  type: string; // "Default" | "English" | "Japanese" | "Synonym" | ...
  title: string;
}

export interface JikanNamedResource {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanDateProp {
  day: number | null;
  month: number | null;
  year: number | null;
}

export interface JikanAired {
  from: string | null;
  to: string | null;
  prop?: {
    from: JikanDateProp;
    to: JikanDateProp;
  };
  string: string | null;
}

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: JikanImages;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  titles?: JikanTitle[];
  type: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  aired: JikanAired | null;
  duration: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  synopsis: string | null;
  season: string | null;
  year: number | null;
  studios?: JikanNamedResource[];
  genres?: JikanNamedResource[];
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page?: number;
  items?: {
    count: number;
    total: number;
    per_page: number;
  };
}

/** Paginated list response, e.g. `/anime`, `/top/anime`, `/seasons/now`. */
export interface JikanListResponse<T> {
  data: T[];
  pagination: JikanPagination;
}

/** Single resource response, e.g. `/anime/{id}`. */
export interface JikanResourceResponse<T> {
  data: T;
}

/** Error payload returned by Jikan for non-2xx responses. */
export interface JikanErrorResponse {
  status: number | string;
  type?: string;
  message?: string;
  error?: string | null;
  report_url?: string;
}

/* ------------------------------------------------------------------ */
/* Request parameters                                                  */
/* ------------------------------------------------------------------ */

export type JikanTopFilter = 'airing' | 'upcoming' | 'bypopularity' | 'favorites';
export type JikanTopType = 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music';

export interface PageParams {
  page?: number;
  limit?: number;
}

export interface SearchAnimeParams extends PageParams {
  q: string;
}

export interface TopAnimeParams extends PageParams {
  filter?: JikanTopFilter;
  type?: JikanTopType;
}
