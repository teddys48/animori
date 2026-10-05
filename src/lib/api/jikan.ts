/**
 * Centralized Jikan v4 HTTP client.
 *
 * Responsibilities:
 *  - Build request URLs from the configured base URL (never hardcoded in UI).
 *  - Throttle requests to respect Jikan's rate limit (~3 req/s, 60 req/min).
 *  - Deduplicate identical in-flight requests and cache successful responses
 *    in memory for a short time, so re-renders / navigation never re-fetch.
 *  - Normalize every failure (network, timeout, HTTP, 429, malformed JSON)
 *    into a `JikanError`.
 *
 * UI components must not import this file directly; use `src/lib/api/anime.ts`.
 */
import { ENV } from '../config/env';
import { JikanError } from './errors';
import type {
  JikanAnime,
  JikanErrorResponse,
  JikanListResponse,
  JikanResourceResponse,
  PageParams,
  SearchAnimeParams,
  TopAnimeParams
} from './types';

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

const BASE_URL = ENV.JIKAN_API_URL.replace(/\/+$/, '');

/** Minimum spacing between request starts. Jikan allows ~3 req/s. */
const MIN_REQUEST_INTERVAL_MS = 350;
/** Extra pause applied to all queued requests after receiving HTTP 429. */
const RATE_LIMIT_COOLDOWN_MS = 2_000;
const REQUEST_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 5 * 60_000;
const MAX_CACHE_ENTRIES = 100;

type QueryValue = string | number | boolean | undefined | null;
type QueryParams = Record<string, QueryValue>;

/* ------------------------------------------------------------------ */
/* Throttle: simple time-slot reservation (no queue library needed)    */
/* ------------------------------------------------------------------ */

let nextSlotAt = 0;

/** Reserve the next available request slot and return how long to wait. */
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
/* In-memory cache + in-flight de-duplication                          */
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
    // Map preserves insertion order: drop the oldest entry.
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, promise });
}

/* ------------------------------------------------------------------ */
/* URL + response helpers                                              */
/* ------------------------------------------------------------------ */

function buildUrl(path: string, params: QueryParams = {}): string {
  const search = new URLSearchParams();
  // Sorted keys give a stable cache key regardless of argument order.
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
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

async function readErrorBody(response: Response): Promise<JikanErrorResponse | undefined> {
  try {
    return (await response.json()) as JikanErrorResponse;
  } catch {
    return undefined;
  }
}

function errorForStatus(response: Response, body?: JikanErrorResponse): JikanError {
  const status = response.status;
  const detail = body?.message ?? response.statusText ?? 'Request failed';

  if (status === 429) {
    const retryAfterMs = parseRetryAfter(response) ?? RATE_LIMIT_COOLDOWN_MS;
    applyCooldown(retryAfterMs);
    return new JikanError('rate-limit', `Rate limited: ${detail}`, { status, retryAfterMs });
  }
  if (status === 404) return new JikanError('not-found', detail, { status });
  if (status === 400 || status === 422) return new JikanError('bad-request', detail, { status });
  return new JikanError('server', `HTTP ${status}: ${detail}`, { status });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isListResponse(body: unknown): body is JikanListResponse<unknown> {
  if (!isObject(body) || !Array.isArray(body.data) || !isObject(body.pagination)) return false;
  return typeof body.pagination.last_visible_page === 'number';
}

function isResourceResponse(body: unknown): body is JikanResourceResponse<unknown> {
  return isObject(body) && isObject(body.data);
}

/** Minimal runtime check that a list item looks like an anime. */
function isAnime(value: unknown): value is JikanAnime {
  return isObject(value) && typeof value.mal_id === 'number' && typeof value.title === 'string';
}

/* ------------------------------------------------------------------ */
/* Core request                                                        */
/* ------------------------------------------------------------------ */

async function performRequest<T>(url: string, validate: (body: unknown) => body is T): Promise<T> {
  await sleep(reserveSlot());

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (cause) {
    if (cause instanceof DOMException && (cause.name === 'TimeoutError' || cause.name === 'AbortError')) {
      throw new JikanError('timeout', 'Request timed out', { cause });
    }
    // fetch rejects with TypeError for DNS/offline/CORS-level failures.
    throw new JikanError('network', 'Network request failed', { cause });
  }

  if (!response.ok) {
    throw errorForStatus(response, await readErrorBody(response));
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new JikanError('malformed', 'Response was not valid JSON', { cause, status: response.status });
  }

  if (!validate(body)) {
    throw new JikanError('malformed', 'Response did not match the expected shape', {
      status: response.status
    });
  }
  return body;
}

/**
 * Cached + de-duplicated request. Failed requests are evicted immediately so a
 * manual retry always results in a fresh (throttled) network request.
 */
function request<T>(path: string, params: QueryParams, validate: (body: unknown) => body is T): Promise<T> {
  const url = buildUrl(path, params);
  const cached = readCache<T>(url);
  if (cached) return cached;

  const promise = performRequest(url, validate);
  writeCache(url, promise);
  promise.catch(() => {
    if (cache.get(url)?.promise === promise) cache.delete(url);
  });
  return promise;
}

function requestAnimeList(path: string, params: QueryParams): Promise<JikanListResponse<JikanAnime>> {
  return request(path, params, isListResponse).then((res) => ({
    pagination: res.pagination,
    data: res.data.filter(isAnime)
  }));
}

/* ------------------------------------------------------------------ */
/* Public client                                                       */
/* ------------------------------------------------------------------ */

export const jikan = {
  /** GET /anime/{id} — prepared for the Phase 3 detail page. */
  async getAnime(id: number): Promise<JikanAnime> {
    const res = await request(`/anime/${id}`, {}, isResourceResponse);
    if (!isAnime(res.data)) throw new JikanError('malformed', 'Unexpected anime payload');
    return res.data;
  },

  /** GET /anime?q= — title search. */
  searchAnime({ q, page, limit }: SearchAnimeParams) {
    return requestAnimeList('/anime', { q, page, limit, sfw: true });
  },

  /** GET /top/anime — optional `filter` (airing/upcoming/...) and `type` (tv/movie/...). */
  getTopAnime({ filter, type, page, limit }: TopAnimeParams = {}) {
    return requestAnimeList('/top/anime', { filter, type, page, limit, sfw: true });
  },

  /** GET /seasons/now — the current broadcast season (determined by Jikan). */
  getSeasonNow({ page, limit }: PageParams = {}) {
    return requestAnimeList('/seasons/now', { page, limit, sfw: true });
  },

  /** GET /seasons/upcoming — titles announced for future seasons. */
  getSeasonUpcoming({ page, limit }: PageParams = {}) {
    return requestAnimeList('/seasons/upcoming', { page, limit, sfw: true });
  }
};
