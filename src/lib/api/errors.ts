/**
 * Normalized error model for Jikan API calls.
 *
 * Every failure coming out of the API layer is converted into a `JikanError`
 * with a `kind`, so the UI can render a friendly message without knowing
 * anything about HTTP, fetch or JSON parsing details.
 */

export type JikanErrorKind =
  | 'network' // offline, DNS failure, CORS/network-level failure
  | 'timeout' // request took too long
  | 'rate-limit' // HTTP 429
  | 'not-found' // HTTP 404
  | 'bad-request' // HTTP 400 / 422 (invalid query params)
  | 'server' // HTTP 5xx or other unexpected status codes
  | 'malformed'; // response body is not the shape we expect

export class JikanError extends Error {
  readonly kind: JikanErrorKind;
  readonly status?: number;
  /** Suggested wait (ms) before retrying, if known. */
  readonly retryAfterMs?: number;

  constructor(
    kind: JikanErrorKind,
    message: string,
    options: { status?: number; retryAfterMs?: number; cause?: unknown } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'JikanError';
    this.kind = kind;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
  }

  /** Whether a manual retry has a reasonable chance of succeeding. */
  get retryable(): boolean {
    return this.kind !== 'not-found' && this.kind !== 'bad-request';
  }
}

/** Coerce anything thrown into a `JikanError`. */
export function toJikanError(error: unknown): JikanError {
  if (error instanceof JikanError) return error;
  return new JikanError('malformed', 'Unexpected error while loading data.', { cause: error });
}

export interface ErrorDescription {
  title: string;
  message: string;
  retryable: boolean;
}

/** User-facing copy for each error kind. Never exposes raw internals. */
export function describeError(error: unknown): ErrorDescription {
  const err = toJikanError(error);

  switch (err.kind) {
    case 'rate-limit':
      return {
        title: 'Slow down a little',
        message:
          'The anime data provider (Jikan) is receiving too many requests right now. Please wait a few seconds and try again.',
        retryable: true
      };
    case 'network':
      return {
        title: 'Connection problem',
        message:
          'We could not reach the anime data provider. Check your internet connection and try again.',
        retryable: true
      };
    case 'timeout':
      return {
        title: 'Request timed out',
        message: 'The anime data provider took too long to respond. Please try again.',
        retryable: true
      };
    case 'not-found':
      return {
        title: 'Not found',
        message: 'The requested anime data does not exist.',
        retryable: false
      };
    case 'bad-request':
      return {
        title: 'Invalid request',
        message: 'This request could not be processed. Try a different search term.',
        retryable: false
      };
    case 'server':
      return {
        title: 'Unable to load anime',
        message:
          'The anime data provider (Jikan) is having trouble at the moment. Please try again later.',
        retryable: true
      };
    case 'malformed':
    default:
      return {
        title: 'Unable to load anime',
        message: 'We received an unexpected response. Please try again later.',
        retryable: true
      };
  }
}
