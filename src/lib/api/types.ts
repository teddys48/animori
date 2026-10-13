/**
 * Focused TypeScript models for the Kitsu JSON:API (edge).
 * See https://kitsu.docs.apiary.io/ for the full schema.
 *
 * These are raw JSON:API shapes. UI components consume the normalized
 * application model (`AnimeItem`) from `src/lib/types/anime.ts` instead.
 */

export interface KitsuImageDimension {
  width?: number;
  height?: number;
}

export interface KitsuImageDimensions {
  tiny?: KitsuImageDimension;
  small?: KitsuImageDimension;
  medium?: KitsuImageDimension;
  large?: KitsuImageDimension;
}

export interface KitsuImageVariants {
  tiny?: string | null;
  small?: string | null;
  medium?: string | null;
  large?: string | null;
  original?: string | null;
  meta?: {
    dimensions?: KitsuImageDimensions;
  };
}

export interface KitsuTitles {
  [key: string]: string | undefined;
  en?: string;
  en_jp?: string;
  ja_jp?: string;
}

export interface KitsuAnimeAttributes {
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  synopsis?: string | null;
  description?: string | null;
  titles?: KitsuTitles;
  canonicalTitle?: string;
  abbreviatedTitles?: string[];
  averageRating?: string | null;
  ratingFrequencies?: Record<string, string>;
  userCount?: number | null;
  favoritesCount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  nextRelease?: string | null;
  popularityRank?: number | null;
  ratingRank?: number | null;
  ageRating?: string | null;
  ageRatingGuide?: string | null;
  subtype?: string | null; // 'TV' | 'movie' | 'OVA' | 'ONA' | 'special' | 'music'
  status?: string | null; // 'current' | 'finished' | 'tba' | 'unapproved' | 'upcoming'
  tba?: string | null;
  posterImage?: KitsuImageVariants | null;
  coverImage?: KitsuImageVariants | null;
  episodeCount?: number | null;
  episodeLength?: number | null;
  totalLength?: number | null;
  youtubeVideoId?: string | null;
  showType?: string | null;
  nsfw?: boolean;
}

export interface KitsuRelationshipLinks {
  self?: string;
  related?: string;
}

export interface KitsuRelationshipData {
  type: string;
  id: string;
}

export interface KitsuRelationship {
  links?: KitsuRelationshipLinks;
  data?: KitsuRelationshipData | KitsuRelationshipData[];
}

export interface KitsuAnimeResource {
  id: string;
  type: 'anime';
  links?: { self?: string };
  attributes: KitsuAnimeAttributes;
  relationships?: Record<string, KitsuRelationship>;
}

export interface KitsuIncludedResource {
  id: string;
  type: string;
  attributes: Record<string, any>;
  relationships?: Record<string, KitsuRelationship>;
}

export interface KitsuPaginationLinks {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
}

export interface KitsuMeta {
  count?: number;
}

export interface KitsuListResponse<T = KitsuAnimeResource> {
  data: T[];
  meta?: KitsuMeta;
  links?: KitsuPaginationLinks;
  included?: KitsuIncludedResource[];
}

export interface KitsuSingleResponse<T = KitsuAnimeResource> {
  data: T;
  included?: KitsuIncludedResource[];
}

export interface KitsuErrorItem {
  id?: string;
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: { pointer?: string; parameter?: string };
}

export interface KitsuErrorResponse {
  errors?: KitsuErrorItem[];
}

/* ------------------------------------------------------------------ */
/* Request parameters                                                  */
/* ------------------------------------------------------------------ */

export interface KitsuPageParams {
  limit?: number;
  offset?: number;
}

export interface KitsuSearchParams extends KitsuPageParams {
  text: string;
}

export interface KitsuListAnimeParams extends KitsuPageParams {
  filter?: Record<string, string | number | boolean | undefined | null>;
  sort?: string;
  include?: string;
}
