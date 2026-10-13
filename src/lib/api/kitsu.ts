/**
 * Centralized Kitsu JSON:API HTTP client.
 *
 * Responsibilities:
 *  - Build request URLs from the configured base URL (never hardcoded in UI).
 *  - Send appropriate JSON:API headers: Accept: application/vnd.api+json.
 *  - Deduplicate identical in-flight requests and cache successful responses
 *    in memory for a short time, avoiding redundant fetches on re-renders / navigation.
 *  - Handle rate limiting gracefully without aggressive retry loops.
 *  - Normalize every failure (network, timeout, HTTP, 429, malformed JSON)
 *    into a `KitsuError`.
 *  - Support request cancellation via AbortSignal.
 *
 * UI components must not import this file directly; use `src/lib/api/anime.ts`.
 */
import { ENV } from '../config/env';
import { KitsuError } from './errors';
import type {
  KitsuAnimeResource,
  KitsuErrorResponse,
  KitsuListResponse,
  KitsuSingleResponse,
  KitsuListAnimeParams,
  KitsuSearchParams,
  KitsuMediaCharacterResource,
  KitsuMediaRelationshipResource
} from './types';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const BASE_URL = ENV.KITSU_API_URL.replace(/\/+$/, '');

/** Minimum spacing between outgoing requests to avoid bursting. */
const MIN_REQUEST_INTERVAL_MS = 100;
/** Extra pause applied to all queued requests after receiving HTTP 429. */
const RATE_LIMIT_COOLDOWN_MS = 2_000;
const REQUEST_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 5 * 60_000;
const MAX_CACHE_ENTRIES = 100;

/* ------------------------------------------------------------------ */
/* Throttle: simple time-slot reservation                             */
/* ------------------------------------------------------------------ */

let nextSlotAt = 0;

function reserveSlot(): number {
  const now = Date.now();
  const startAt = Math.max(now, nextSlotAt);
  nextSlotAt = startAt + MIN_REQUEST_INTERVAL_MS;
  return startAt - now;
}

function applyCooldown(ms: number): void {
  nextSlotAt = Math.max(nextSlotAt, Date.now() + ms);
}

function sleep(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}

/* ------------------------------------------------------------------ */
/* In-memory cache + in-flight deduplication                           */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  expiresAt: number;
  promise: Promise<unknown>;
}

const cache = new Map<string, CacheEntry>();

function readCache<T>(key: string): Promise<T> | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.promise as Promise<T>;
}

function writeCache(key: string, promise: Promise<unknown>): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, promise });
}

/* ------------------------------------------------------------------ */
/* URL + response helpers                                              */
/* ------------------------------------------------------------------ */

export function buildKitsuUrl(path: string, params: Record<string, any> = {}): string {
  const search = new URLSearchParams();

  function appendParam(prefix: string, value: any) {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [subKey, subVal] of Object.entries(value)) {
        appendParam(`${prefix}[${subKey}]`, subVal);
      }
    } else {
      search.set(prefix, String(value));
    }
  }

  const sortedKeys = Object.keys(params).sort();
  for (const key of sortedKeys) {
    appendParam(key, params[key]);
  }

  const qs = search.toString();
  return `${BASE_URL}${path}${qs ? `?${qs}` : ''}`;
}

function parseRetryAfter(response: Response): number | undefined {
  const header = response.headers.get('Retry-After');
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : undefined;
}

async function readErrorBody(response: Response): Promise<KitsuErrorResponse | undefined> {
  try {
    return (await response.json()) as KitsuErrorResponse;
  } catch {
    return undefined;
  }
}

function errorForStatus(response: Response, body?: KitsuErrorResponse): KitsuError {
  const status = response.status;
  const firstError = body?.errors?.[0];
  const detail = firstError?.detail || firstError?.title || response.statusText || 'Request failed';

  if (status === 429) {
    const retryAfterMs = parseRetryAfter(response) ?? RATE_LIMIT_COOLDOWN_MS;
    applyCooldown(retryAfterMs);
    return new KitsuError('rate-limit', `Rate limited: ${detail}`, { status, retryAfterMs });
  }
  if (status === 404) return new KitsuError('not-found', detail, { status });
  if (status === 400 || status === 422) return new KitsuError('bad-request', detail, { status });
  return new KitsuError('server', `HTTP ${status}: ${detail}`, { status });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isListResponse(body: unknown): body is KitsuListResponse<unknown> {
  return isObject(body) && Array.isArray(body.data);
}

function isSingleResponse(body: unknown): body is KitsuSingleResponse<unknown> {
  return isObject(body) && isObject(body.data);
}

export function isKitsuAnime(value: unknown): value is KitsuAnimeResource {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    value.type === 'anime' &&
    isObject(value.attributes)
  );
}

/* ------------------------------------------------------------------ */
/* Core request                                                        */
/* ------------------------------------------------------------------ */

async function performRequest<T>(
  url: string,
  validate: (body: unknown) => body is T,
  signal?: AbortSignal
): Promise<T> {
  if (signal?.aborted) {
    throw new DOMException('Request was aborted', 'AbortError');
  }

  await sleep(reserveSlot());

  if (signal?.aborted) {
    throw new DOMException('Request was aborted', 'AbortError');
  }

  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json'
      },
      signal: combinedSignal
    });
  } catch (cause) {
    if (signal?.aborted) {
      throw new DOMException('Request was aborted', 'AbortError');
    }
    if (cause instanceof DOMException && (cause.name === 'TimeoutError' || cause.name === 'AbortError')) {
      throw new KitsuError('timeout', 'Request timed out', { cause });
    }
    throw new KitsuError('network', 'Network request failed', { cause });
  }

  if (!response.ok) {
    throw errorForStatus(response, await readErrorBody(response));
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new KitsuError('malformed', 'Response was not valid JSON', {
      cause,
      status: response.status
    });
  }

  if (!validate(body)) {
    throw new KitsuError('malformed', 'Response did not match the expected JSON:API shape', {
      status: response.status
    });
  }
  return body;
}

function request<T>(
  path: string,
  params: Record<string, any>,
  validate: (body: unknown) => body is T,
  signal?: AbortSignal
): Promise<T> {
  const url = buildKitsuUrl(path, params);
  const cached = readCache<T>(url);
  if (cached) return cached;

  const promise = performRequest(url, validate, signal);
  writeCache(url, promise);
  promise.catch(() => {
    if (cache.get(url)?.promise === promise) cache.delete(url);
  });
  return promise;
}

/* ------------------------------------------------------------------ */
/* Public client                                                       */
/* ------------------------------------------------------------------ */

export const kitsu = {
  /** GET /anime/{id} with optional include (e.g. 'genres,categories') */
  async getAnime(
    id: string | number,
    include?: string,
    signal?: AbortSignal
  ): Promise<KitsuSingleResponse<KitsuAnimeResource>> {
    const params: Record<string, any> = {};
    if (include) params.include = include;
    const res = await request(`/anime/${id}`, params, isSingleResponse, signal);
    if (!isKitsuAnime(res.data)) {
      throw new KitsuError('malformed', 'Unexpected anime payload from Kitsu');
    }
    return res as KitsuSingleResponse<KitsuAnimeResource>;
  },

  /** GET /anime/{id}/characters with character and voices.person */
  async getAnimeCharacters(
    id: string | number,
    limit = 12,
    signal?: AbortSignal
  ): Promise<KitsuListResponse<KitsuMediaCharacterResource>> {
    return request(
      `/anime/${id}/characters`,
      {
        include: 'character,voices.person',
        sort: 'role',
        page: { limit }
      },
      isListResponse,
      signal
    ) as Promise<KitsuListResponse<KitsuMediaCharacterResource>>;
  },

  /** GET /anime/{id}/media-relationships with destination */
  async getAnimeMediaRelationships(
    id: string | number,
    limit = 20,
    signal?: AbortSignal
  ): Promise<KitsuListResponse<KitsuMediaRelationshipResource>> {
    return request(
      `/anime/${id}/media-relationships`,
      {
        include: 'destination',
        page: { limit }
      },
      isListResponse,
      signal
    ) as Promise<KitsuListResponse<KitsuMediaRelationshipResource>>;
  },

  /** GET /anime with filter[text] */
  searchAnime({ text, limit, offset, signal }: KitsuSearchParams): Promise<KitsuListResponse<KitsuAnimeResource>> {
    return request(
      '/anime',
      {
        filter: { text: text.trim() },
        page: { limit, offset }
      },
      isListResponse,
      signal
    ) as Promise<KitsuListResponse<KitsuAnimeResource>>;
  },

  /** Generic GET /anime with filters, sorting, and pagination */
  listAnime({
    filter,
    sort,
    limit,
    offset,
    include,
    signal
  }: KitsuListAnimeParams): Promise<KitsuListResponse<KitsuAnimeResource>> {
    const params: Record<string, any> = {};
    if (filter) params.filter = filter;
    if (sort) params.sort = sort;
    if (limit !== undefined || offset !== undefined) {
      params.page = { limit, offset };
    }
    if (include) params.include = include;

    return request('/anime', params, isListResponse, signal) as Promise<KitsuListResponse<KitsuAnimeResource>>;
  },

  /** GET /trending/anime — official Kitsu trending endpoint */
  getTrendingAnime(limit = 10, signal?: AbortSignal): Promise<KitsuListResponse<KitsuAnimeResource>> {
    return request('/trending/anime', { limit }, isListResponse, signal) as Promise<KitsuListResponse<KitsuAnimeResource>>;
  }
};
