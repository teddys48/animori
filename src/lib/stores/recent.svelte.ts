/**
 * Recently Viewed Anime store.
 *
 * Records user visits to anime detail pages.
 * Persists minimal metadata in localStorage, deduplicated, ordered most recent first,
 * with a safe limit of 16 entries.
 */
import { untrack } from 'svelte';
import type { AnimeItem, AnimeType } from '../types/anime';

export interface RecentAnimeItem {
  id: string;
  title: string;
  poster: string;
  type?: AnimeType;
  score?: number | null;
  year?: number | null;
  viewedAt: number;
}

const STORAGE_KEY = 'animori_recent_views';
const MAX_RECENT_ITEMS = 16;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function sanitizeRecent(raw: any): RecentAnimeItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id || '').trim();
  if (!id) return null;

  return {
    id,
    title: typeof raw.title === 'string' ? raw.title : 'Unknown Title',
    poster: typeof raw.poster === 'string' ? raw.poster : '',
    type: typeof raw.type === 'string' ? (raw.type as AnimeType) : undefined,
    score: typeof raw.score === 'number' ? raw.score : null,
    year: typeof raw.year === 'number' ? raw.year : null,
    viewedAt: typeof raw.viewedAt === 'number' ? raw.viewedAt : Date.now()
  };
}

class RecentStore {
  items = $state<RecentAnimeItem[]>([]);

  constructor() {
    this.#load();
  }

  #load(): void {
    if (!isBrowser()) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const sanitized: RecentAnimeItem[] = [];
        const seen = new Set<string>();
        for (const item of parsed) {
          const entry = sanitizeRecent(item);
          if (entry && !seen.has(entry.id)) {
            seen.add(entry.id);
            sanitized.push(entry);
          }
        }
        this.items = sanitized.slice(0, MAX_RECENT_ITEMS);
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[animori] Failed to load recent views from localStorage:', e);
      }
    }
  }

  #save(): void {
    if (!isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[animori] Failed to save recent views to localStorage:', e);
      }
    }
  }

  recordView(anime: AnimeItem): void {
    untrack(() => {
      const id = String(anime.id).trim();
      if (!id) return;

      const entry: RecentAnimeItem = {
        id,
        title: anime.title,
        poster: anime.poster,
        type: anime.type,
        score: anime.score,
        year: anime.year,
        viewedAt: Date.now()
      };

      // Remove existing if present, prepend new entry
      const filtered = this.items.filter((item) => item.id !== id);
      this.items = [entry, ...filtered].slice(0, MAX_RECENT_ITEMS);
      this.#save();
    });
  }

  clear(): void {
    untrack(() => {
      this.items = [];
      if (isBrowser()) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // Ignore storage errors
        }
      }
    });
  }
}

export const recentStore = new RecentStore();

export function recentToAnimeItem(recent: RecentAnimeItem): AnimeItem {
  return {
    id: recent.id,
    title: recent.title,
    poster: recent.poster,
    type: recent.type,
    score: recent.score ?? null,
    year: recent.year ?? null,
    genres: []
  };
}
