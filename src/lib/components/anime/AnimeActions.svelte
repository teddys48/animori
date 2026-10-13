<script lang="ts">
  import {
    userLibrary,
    WATCH_STATUSES,
    getStatusMeta,
    type WatchStatus,
    type UserAnimeEntry
  } from '../../stores/library.svelte';
  import type { AnimeItem } from '../../types/anime';

  interface Props {
    anime: AnimeItem | UserAnimeEntry;
    /** 'card' = compact icons overlay, 'hero' = full prominent buttons, 'row' = inline list row */
    variant?: 'card' | 'hero' | 'row';
    class?: string;
  }

  let { anime, variant = 'hero', class: className = '' }: Props = $props();

  let isFav = $derived(userLibrary.isFavorite(anime.id));
  let currentStatus = $derived(userLibrary.getWatchStatus(anime.id));
  let statusMeta = $derived(getStatusMeta(currentStatus));

  let isDropdownOpen = $state(false);

  function toggleFav(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    userLibrary.toggleFavorite(anime);
  }

  function handleSelectStatus(e: MouseEvent, status: WatchStatus | null) {
    e.preventDefault();
    e.stopPropagation();
    userLibrary.setWatchStatus(anime, status);
    isDropdownOpen = false;
  }

  function toggleDropdown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isDropdownOpen = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} onclick={() => (isDropdownOpen = false)} />

{#if variant === 'hero'}
  <!-- Hero Page Action Controls -->
  <div class="relative inline-flex flex-wrap items-center gap-2.5 {className}">
    <!-- Favorite Button -->
    <button
      type="button"
      onclick={toggleFav}
      class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 {isFav
        ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
        : 'bg-[var(--glass-bg-base)] text-[var(--text-secondary)] hover:text-rose-500 border border-[var(--glass-border)] hover:border-rose-500/30 hover:bg-[var(--glass-bg-elevated)]'}"
      aria-label={isFav ? `Remove ${anime.title} from favorites` : `Add ${anime.title} to favorites`}
      aria-pressed={isFav}
    >
      <svg
        class="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 {isFav ? 'fill-current scale-110 text-rose-500' : 'text-current'}"
        fill={isFav ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{isFav ? 'Favorited' : 'Favorite'}</span>
    </button>

    <!-- Watchlist Dropdown Trigger -->
    <div class="relative">
      <button
        type="button"
        onclick={toggleDropdown}
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198754] {currentStatus
          ? 'bg-[#198754]/20 text-[#198754] dark:text-[#20c997] border border-[#198754]/40 hover:bg-[#198754]/30'
          : 'bg-[var(--glass-bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg-elevated)]'}"
        aria-label={`Watchlist status: ${statusMeta?.label ?? 'None'}`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        {#if statusMeta}
          <span class="w-2 h-2 rounded-full {statusMeta.dotColor} shrink-0 shadow-xs"></span>
          <span>{statusMeta.label}</span>
        {:else}
          <svg class="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add to Watchlist</span>
        {/if}
        <svg
          class="w-3.5 h-3.5 ml-0.5 text-[var(--text-muted)] transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      {#if isDropdownOpen}
        <div
          class="absolute left-0 mt-2 w-52 rounded-2xl glass-modal shadow-2xl border border-[var(--glass-border)] p-1.5 z-50 animate-fade-in text-xs font-medium backdrop-blur-2xl bg-white/95 dark:bg-[#0c1222]/95"
          role="menu"
          aria-label="Select Watchlist Status"
        >
          <div class="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[var(--text-dim)] border-b border-[var(--glass-border)] mb-1">
            Watchlist Status
          </div>

          {#each WATCH_STATUSES as statusItem}
            <button
              type="button"
              onclick={(e) => handleSelectStatus(e, statusItem.key)}
              class="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer {currentStatus === statusItem.key
                ? 'bg-[#198754]/15 text-[#198754] dark:text-[#20c997] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)]'}"
              role="menuitem"
            >
              <span class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full {statusItem.dotColor}"></span>
                <span>{statusItem.label}</span>
              </span>
              {#if currentStatus === statusItem.key}
                <svg class="w-4 h-4 text-[#198754] dark:text-[#20c997]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          {/each}

          {#if currentStatus}
            <div class="pt-1 mt-1 border-t border-[var(--glass-border)]">
              <button
                type="button"
                onclick={(e) => handleSelectStatus(e, null)}
                class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                role="menuitem"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Remove from Watchlist</span>
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

{:else if variant === 'card'}
  <!-- Compact Overlay for AnimeCard -->
  <div class="relative z-20 flex items-center gap-1.5 {className}">
    <!-- Quick Favorite Button -->
    <button
      type="button"
      onclick={toggleFav}
      class="p-1.5 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 {isFav
        ? 'bg-rose-600/90 text-white shadow-rose-900/40'
        : 'bg-black/60 text-white/80 hover:text-rose-400 hover:bg-black/80'}"
      aria-label={isFav ? `Remove ${anime.title} from favorites` : `Add ${anime.title} to favorites`}
      title={isFav ? 'Favorited' : 'Add to Favorites'}
    >
      <svg
        class="w-4 h-4 transition-transform {isFav ? 'scale-110' : ''}"
        fill={isFav ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>

    <!-- Watchlist Quick Trigger -->
    <div class="relative">
      <button
        type="button"
        onclick={toggleDropdown}
        class="p-1.5 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198754] {currentStatus
          ? 'bg-[#198754]/90 text-white shadow-[#198754]/40'
          : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'}"
        aria-label={`Watchlist: ${statusMeta?.label ?? 'None'}`}
        title={statusMeta ? `Status: ${statusMeta.label}` : 'Add to Watchlist'}
      >
        {#if statusMeta}
          <span class="w-2.5 h-2.5 rounded-full {statusMeta.dotColor} block"></span>
        {:else}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        {/if}
      </button>

      <!-- Dropdown Menu for Card -->
      {#if isDropdownOpen}
        <div
          class="absolute right-0 top-full mt-1.5 w-48 rounded-2xl glass-modal shadow-2xl border border-[var(--glass-border)] p-1.5 z-50 text-xs font-medium backdrop-blur-2xl bg-white/95 dark:bg-[#0c1222]/95"
          role="menu"
          aria-label="Select Watchlist Status"
        >
          {#each WATCH_STATUSES as statusItem}
            <button
              type="button"
              onclick={(e) => handleSelectStatus(e, statusItem.key)}
              class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer {currentStatus === statusItem.key
                ? 'bg-[#198754]/15 text-[#198754] dark:text-[#20c997] font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)]'}"
              role="menuitem"
            >
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full {statusItem.dotColor}"></span>
                <span>{statusItem.label}</span>
              </span>
              {#if currentStatus === statusItem.key}
                <svg class="w-3.5 h-3.5 text-[#198754] dark:text-[#20c997]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          {/each}

          {#if currentStatus}
            <div class="pt-1 mt-1 border-t border-[var(--glass-border)]">
              <button
                type="button"
                onclick={(e) => handleSelectStatus(e, null)}
                class="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-left text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer font-medium"
                role="menuitem"
              >
                <span>Remove</span>
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>

{:else if variant === 'row'}
  <!-- Inline Row Controls for Saved Lists -->
  <div class="flex items-center gap-2 {className}">
    <div class="relative">
      <select
        value={currentStatus ?? ''}
        onchange={(e) => {
          const val = (e.target as HTMLSelectElement).value;
          userLibrary.setWatchStatus(anime, val ? (val as WatchStatus) : null);
        }}
        class="text-xs px-2.5 py-1.5 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
        aria-label="Change Watchlist Status"
      >
        <option value="">Not on Watchlist</option>
        {#each WATCH_STATUSES as statusItem}
          <option value={statusItem.key}>{statusItem.label}</option>
        {/each}
      </select>
    </div>

    <button
      type="button"
      onclick={toggleFav}
      class="p-2 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-bg-subtle)] transition-colors cursor-pointer text-xs {isFav ? 'text-rose-500 border-rose-500/30' : 'text-[var(--text-muted)]'}"
      aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
      title={isFav ? 'Favorited' : 'Favorite'}
    >
      <svg class="w-4 h-4 {isFav ? 'fill-current' : 'none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  </div>
{/if}
