/**
 * User Library store for client-side personalization (Favorites & Watchlist).
 *
 * Persists minimal anime metadata to localStorage using Svelte 5 runes.
 * Prevents duplicates, validates stored schema safely, and provides reactive
 * state across all components (cards, detail hero, dedicated pages).
 */
import { untrack } from 'svelte';
import type { AnimeItem, AnimeType } from '../types/anime';
import { toastStore } from './toast.svelte';

export type WatchStatus =
  | 'plan_to_watch'
  | 'watching'
  | 'completed'
  | 'on_hold'
  | 'dropped';

export interface WatchStatusMeta {
  key: WatchStatus;
  label: string;
  badgeVariant: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info';
  dotColor: string;
}

export const WATCH_STATUSES: readonly WatchStatusMeta[] = [
  { key: 'watching', label: 'Watching', badgeVariant: 'success', dotColor: 'bg-emerald-500' },
  { key: 'plan_to_watch', label: 'Plan to Watch', badgeVariant: 'info', dotColor: 'bg-sky-500' },
  { key: 'completed', label: 'Completed', badgeVariant: 'primary', dotColor: 'bg-purple-500' },
  { key: 'on_hold', label: 'On Hold', badgeVariant: 'warning', dotColor: 'bg-amber-500' },
  { key: 'dropped', label: 'Dropped', badgeVariant: 'secondary', dotColor: 'bg-rose-500' }
];

export function getStatusMeta(status?: WatchStatus | null): WatchStatusMeta | undefined {
  if (!status) return undefined;
  return WATCH_STATUSES.find((s) => s.key === status);
}

export interface UserAnimeEntry {
  id: string;
  title: string;
  poster: string;
  type?: AnimeType;
  year?: number | null;
  score?: number | null;
  isFavorite: boolean;
  watchStatus?: WatchStatus | null;
  updatedAt: number;
}

const STORAGE_KEY = 'animori_user_library';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function normalizeId(id: string | number): string {
  return String(id).trim();
}

function isValidWatchStatus(val: unknown): val is WatchStatus {
  return (
    typeof val === 'string' &&
    ['plan_to_watch', 'watching', 'completed', 'on_hold', 'dropped'].includes(val)
  );
}

function sanitizeEntry(raw: any): UserAnimeEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = normalizeId(raw.id);
  if (!id) return null;

  return {
    id,
    title: typeof raw.title === 'string' ? raw.title : 'Unknown Title',
    poster: typeof raw.poster === 'string' ? raw.poster : '',
    type: typeof raw.type === 'string' ? (raw.type as AnimeType) : undefined,
    year: typeof raw.year === 'number' ? raw.year : null,
    score: typeof raw.score === 'number' ? raw.score : null,
    isFavorite: Boolean(raw.isFavorite),
    watchStatus: isValidWatchStatus(raw.watchStatus) ? raw.watchStatus : null,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now()
  };
}

class UserLibraryStore {
  // Map of normalized id -> UserAnimeEntry
  #entries = $state<Map<string, UserAnimeEntry>>(new Map());

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
        const nextMap = new Map<string, UserAnimeEntry>();
        for (const item of parsed) {
          const valid = sanitizeEntry(item);
          if (valid && (valid.isFavorite || valid.watchStatus)) {
            nextMap.set(valid.id, valid);
          }
        }
        this.#entries = nextMap;
      }
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[animori] Failed to load user library from localStorage:', e);
      }
    }
  }

  #save(): void {
    if (!isBrowser()) return;
    try {
      const list = Array.from(this.#entries.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[animori] Failed to save user library to localStorage:', e);
      }
    }
  }

  // Reactive derived getters
  get all(): UserAnimeEntry[] {
    return Array.from(this.#entries.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  get favorites(): UserAnimeEntry[] {
    return this.all.filter((e) => e.isFavorite);
  }

  get watchlist(): UserAnimeEntry[] {
    return this.all.filter((e) => Boolean(e.watchStatus));
  }

  get countFavorites(): number {
    return this.favorites.length;
  }

  get countWatchlist(): number {
    return this.watchlist.length;
  }

  get countsByStatus(): Record<WatchStatus, number> {
    const counts: Record<WatchStatus, number> = {
      plan_to_watch: 0,
      watching: 0,
      completed: 0,
      on_hold: 0,
      dropped: 0
    };
    for (const e of this.watchlist) {
      if (e.watchStatus && counts[e.watchStatus] !== undefined) {
        counts[e.watchStatus]++;
      }
    }
    return counts;
  }

  getEntry(id: string | number): UserAnimeEntry | undefined {
    return this.#entries.get(normalizeId(id));
  }

  isFavorite(id: string | number): boolean {
    return Boolean(this.getEntry(id)?.isFavorite);
  }

  getWatchStatus(id: string | number): WatchStatus | null {
    return this.getEntry(id)?.watchStatus ?? null;
  }

  /**
   * Toggle favorite status for an anime.
   * Returns new favorite status.
   */
  toggleFavorite(anime: AnimeItem | UserAnimeEntry, silent = false): boolean {
    return untrack(() => {
      const id = normalizeId(anime.id);
      const existing = this.#entries.get(id);
      const willBeFavorite = !existing?.isFavorite;

      if (willBeFavorite) {
        const updated: UserAnimeEntry = {
          id,
          title: anime.title,
          poster: anime.poster,
          type: anime.type,
          year: anime.year,
          score: anime.score,
          isFavorite: true,
          watchStatus: existing?.watchStatus ?? null,
          updatedAt: Date.now()
        };
        const next = new Map(this.#entries);
        next.set(id, updated);
        this.#entries = next;
        this.#save();
        if (!silent) toastStore.show(`Added "${anime.title}" to Favorites!`, 'success');
        return true;
      } else {
        if (existing?.watchStatus) {
          // Still has watchlist status, just un-favorite
          const updated: UserAnimeEntry = {
            ...existing,
            isFavorite: false,
            updatedAt: Date.now()
          };
          const next = new Map(this.#entries);
          next.set(id, updated);
          this.#entries = next;
        } else {
          // Neither favorite nor watchlist, prune entry
          const next = new Map(this.#entries);
          next.delete(id);
          this.#entries = next;
        }
        this.#save();
        if (!silent) toastStore.show(`Removed "${anime.title}" from Favorites.`, 'info');
        return false;
      }
    });
  }

  /**
   * Set or clear watchlist status for an anime.
   */
  setWatchStatus(
    anime: AnimeItem | UserAnimeEntry,
    status: WatchStatus | null,
    silent = false
  ): void {
    untrack(() => {
      const id = normalizeId(anime.id);
      const existing = this.#entries.get(id);

      if (status) {
        const updated: UserAnimeEntry = {
          id,
          title: anime.title,
          poster: anime.poster,
          type: anime.type,
          year: anime.year,
          score: anime.score,
          isFavorite: existing?.isFavorite ?? false,
          watchStatus: status,
          updatedAt: Date.now()
        };
        const next = new Map(this.#entries);
        next.set(id, updated);
        this.#entries = next;
        this.#save();
        if (!silent) {
          const meta = getStatusMeta(status);
          toastStore.show(`Set "${anime.title}" to ${meta?.label ?? status}!`, 'success');
        }
      } else {
        // Remove from watchlist
        if (existing?.isFavorite) {
          const updated: UserAnimeEntry = {
            ...existing,
            watchStatus: null,
            updatedAt: Date.now()
          };
          const next = new Map(this.#entries);
          next.set(id, updated);
          this.#entries = next;
        } else {
          const next = new Map(this.#entries);
          next.delete(id);
          this.#entries = next;
        }
        this.#save();
        if (!silent) toastStore.show(`Removed "${anime.title}" from Watchlist.`, 'info');
      }
    });
  }

  /** Remove completely from favorites and watchlist */
  removeEntry(id: string | number, silent = false): void {
    untrack(() => {
      const cleanId = normalizeId(id);
      const existing = this.#entries.get(cleanId);
      if (!existing) return;

      const next = new Map(this.#entries);
      next.delete(cleanId);
      this.#entries = next;
      this.#save();
      if (!silent) toastStore.show(`Removed "${existing.title}" from your library.`, 'info');
    });
  }
}

export const userLibrary = new UserLibraryStore();

/** Convert a UserAnimeEntry to AnimeItem so AnimeCard can render it seamlessly */
export function entryToAnimeItem(entry: UserAnimeEntry): AnimeItem {
  return {
    id: entry.id,
    title: entry.title,
    poster: entry.poster,
    type: entry.type,
    year: entry.year ?? null,
    score: entry.score ?? null,
    genres: []
  };
}
