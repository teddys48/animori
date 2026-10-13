import { KitsuError, toKitsuError } from './errors';

export type ResourceStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Minimal reactive wrapper around an async loader with cancellation & race condition protection.
 *
 * - Tracks loading / success / error state for the UI.
 * - Cancels previous in-flight requests using AbortController on new load calls.
 * - Ignores stale responses when a newer `load()` has started.
 * - `retry()` re-runs the last loader.
 */
export class Resource<T> {
  status = $state<ResourceStatus>('idle');
  data = $state<T | null>(null);
  error = $state<KitsuError | null>(null);

  #token = 0;
  #lastLoader: ((signal?: AbortSignal) => Promise<T>) | null = null;
  #abortController: AbortController | null = null;

  get loading(): boolean {
    return this.status === 'loading' || this.status === 'idle';
  }

  async load(loader: (signal?: AbortSignal) => Promise<T>): Promise<void> {
    if (this.#abortController) {
      this.#abortController.abort();
    }
    const controller = new AbortController();
    this.#abortController = controller;

    const token = ++this.#token;
    this.#lastLoader = loader;
    this.status = 'loading';
    this.error = null;

    try {
      const result = await loader(controller.signal);
      if (token !== this.#token) return;
      this.data = result;
      this.status = 'success';
    } catch (err) {
      if (token !== this.#token) return;
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      this.data = null;
      this.error = toKitsuError(err);
      this.status = 'error';
      if (import.meta.env.DEV) console.warn('[animori] request failed:', err);
    }
  }

  retry = (): void => {
    if (this.#lastLoader) void this.load(this.#lastLoader);
  };
}
