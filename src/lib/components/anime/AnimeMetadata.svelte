<script lang="ts">
  import type { AnimeItem } from '../../types/anime';

  interface Props {
    anime: AnimeItem;
    class?: string;
  }

  let { anime, class: className = '' }: Props = $props();

  function formatTotalLength(mins?: number | null): string | null {
    if (!mins || mins <= 0) return null;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) {
      return `${hours} hr ${remainingMins} min`;
    }
    if (hours > 0) return `${hours} hr`;
    return `${mins} min`;
  }

  let totalDuration = $derived(formatTotalLength(anime.totalLength));
</script>

<aside
  class="glass-panel p-5 sm:p-6 rounded-3xl border border-[var(--glass-border)] space-y-5 {className}"
  aria-label="Anime Information Details"
>
  <div class="flex items-center gap-2 pb-3 border-b border-[var(--glass-border)]">
    <span class="w-1.5 h-4 rounded-full bg-[#198754]"></span>
    <h2 class="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
      Information
    </h2>
  </div>

  <dl class="space-y-3.5 text-xs">
    {#if anime.type}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Format</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{anime.type}</dd>
      </div>
    {/if}

    {#if anime.status}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Status</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{anime.status}</dd>
      </div>
    {/if}

    {#if anime.episodes}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Episodes</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{anime.episodes}</dd>
      </div>
    {/if}

    {#if anime.duration}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Episode Length</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{anime.duration}</dd>
      </div>
    {/if}

    {#if totalDuration}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Total Runtime</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{totalDuration}</dd>
      </div>
    {/if}

    {#if anime.aired?.label}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Aired Period</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{anime.aired.label}</dd>
      </div>
    {:else if anime.startDate}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Release Date</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">
          {anime.startDate}
          {#if anime.endDate && anime.endDate !== anime.startDate}
            – {anime.endDate}
          {/if}
        </dd>
      </div>
    {/if}

    {#if anime.year}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Year</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">{anime.year}</dd>
      </div>
    {/if}

    {#if anime.ageRating}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Age Rating</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">
          {anime.ageRating}
          {#if anime.ageRatingGuide}
            <span class="text-[var(--text-muted)] font-normal block sm:inline">
              ({anime.ageRatingGuide})
            </span>
          {/if}
        </dd>
      </div>
    {/if}

    {#if anime.score !== null && anime.score > 0}
      <div class="flex justify-between items-baseline gap-2 pt-2 border-t border-[var(--glass-border)]">
        <dt class="text-[var(--text-muted)] font-medium">Score</dt>
        <dd class="text-amber-500 dark:text-amber-400 font-bold text-right flex items-center gap-1 justify-end">
          <span>★ {anime.score.toFixed(1)}</span>
          {#if anime.scoreRaw}
            <span class="text-[10px] text-[var(--text-muted)] font-normal">({anime.scoreRaw})</span>
          {/if}
        </dd>
      </div>
    {/if}

    {#if anime.rank}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Ranked</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">#{anime.rank}</dd>
      </div>
    {/if}

    {#if anime.popularity}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Popularity</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">#{anime.popularity}</dd>
      </div>
    {/if}

    {#if anime.members}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Members</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">
          {anime.members.toLocaleString()}
        </dd>
      </div>
    {/if}

    {#if anime.favoritesCount}
      <div class="flex justify-between items-baseline gap-2">
        <dt class="text-[var(--text-muted)] font-medium">Favorites</dt>
        <dd class="text-[var(--text-primary)] font-semibold text-right">
          {anime.favoritesCount.toLocaleString()}
        </dd>
      </div>
    {/if}
  </dl>

  {#if anime.categories && anime.categories.length > 0}
    <div class="pt-4 border-t border-[var(--glass-border)] space-y-2">
      <div class="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-muted)]">
        Tags & Themes
      </div>
      <div class="flex flex-wrap gap-1.5">
        {#each anime.categories.slice(0, 10) as category}
          <span
            class="text-[11px] px-2 py-0.5 rounded-lg bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] border border-[var(--glass-border)]"
          >
            {category}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  {#if anime.url}
    <div class="pt-3 border-t border-[var(--glass-border)] text-center">
      <a
        href={anime.url}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-xs text-[#198754] dark:text-[#20c997] hover:underline font-semibold"
      >
        <span>Open on Kitsu Community</span>
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  {/if}
</aside>
