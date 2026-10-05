/**
 * Minimal History API router for the Animori SPA.
 *
 * - Reactive `path` and `query` so pages can derive state from the URL
 *   (search term, page number, category) — URL is the source of truth.
 * - Intercepts same-origin `<a href>` clicks for client-side navigation,
 *   so regular links work with refresh, back/forward and sharing.
 */

export interface NavigateOptions {
  replace?: boolean;
  /** Scroll to top after navigation (default: true). */
  scroll?: boolean;
}

class Router {
  path = $state(window.location.pathname);
  search = $state(window.location.search);

  query = $derived(new URLSearchParams(this.search));

  #started = false;

  navigate(to: string, { replace = false, scroll = true }: NavigateOptions = {}): void {
    const url = new URL(to, window.location.origin);
    const next = url.pathname + url.search + url.hash;
    const current = window.location.pathname + window.location.search + window.location.hash;

    if (next !== current) {
      if (replace) history.replaceState(null, '', next);
      else history.pushState(null, '', next);
    }
    this.#sync();
    if (scroll) window.scrollTo({ top: 0 });
  }

  #sync = (): void => {
    this.path = window.location.pathname;
    this.search = window.location.search;
  };

  #onClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = (event.target as Element | null)?.closest?.('a');
    if (!anchor || !anchor.href) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.hasAttribute('download') || anchor.dataset.native !== undefined) return;

    const url = new URL(anchor.href);
    if (url.origin !== window.location.origin) return;

    // Same-page hash links (e.g. "#popular"): let the browser scroll natively.
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
      return;
    }

    event.preventDefault();
    this.navigate(url.pathname + url.search + url.hash);
  };

  /** Attach global listeners once. Returns a cleanup function. */
  start(): () => void {
    if (this.#started) return () => {};
    this.#started = true;
    window.addEventListener('popstate', this.#sync);
    document.addEventListener('click', this.#onClick);
    return () => {
      this.#started = false;
      window.removeEventListener('popstate', this.#sync);
      document.removeEventListener('click', this.#onClick);
    };
  }
}

export const router = new Router();

/** Parse a positive integer `page` query param, defaulting to 1. */
export function parsePage(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

/** Build a URL path with query params, omitting empty values. */
export function buildHref(path: string, params: Record<string, string | number | null | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}
