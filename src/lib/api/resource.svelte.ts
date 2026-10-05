import { JikanError, toJikanError } from './errors';

export type ResourceStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Minimal reactive wrapper around an async loader.
 *
 * - Tracks loading / success / error state for the UI.
 * - Ignores stale responses when a newer `load()` has started
 *   (e.g. fast pagination clicks or back/forward navigation).
 * - `retry()` re-runs the last loader; failed requests are never cached by the
 *   Jikan client, so a retry results in a new, throttled request.
 */
export class Resource<T> {
  status = $state<ResourceStatus>('idle');
  data = $state<T | null>(null);
  error = $state<JikanError | null>(null);

  #token = 0;
  #lastLoader: (() => Promise<T>) | null = null;

  get loading(): boolean {
    return this.status === 'loading' || this.status === 'idle';
  }

  async load(loader: () => Promise<T>): Promise<void> {
    const token = ++this.#token;
    this.#lastLoader = loader;
    this.status = 'loading';
    this.error = null;

    try {
      const result = await loader();
      if (token !== this.#token) return;
      this.data = result;
      this.status = 'success';
    } catch (err) {
      if (token !== this.#token) return;
      this.data = null;
      this.error = toJikanError(err);
      this.status = 'error';
      if (import.meta.env.DEV) console.warn('[animori] request failed:', err);
    }
  }

  retry = (): void => {
    if (this.#lastLoader) void this.load(this.#lastLoader);
  };
}
