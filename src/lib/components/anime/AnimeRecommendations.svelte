<script lang="ts">
  import type { AnimeItem } from '../../types/anime';
  import AnimeCard from './AnimeCard.svelte';
  import AnimeCardSkeleton from './AnimeCardSkeleton.svelte';

  interface Props {
    items: AnimeItem[];
    category?: string;
    loading?: boolean;
    error?: unknown;
  }

  let { items, category, loading = false, error }: Props = $props();
</script>

{#if !loading && !error && items.length === 0}
  <!-- Omit section if no recommendations available -->
{:else}
  <section class="space-y-4 pt-4 border-t border-[var(--glass-border)]" aria-label="More Anime to Explore">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="w-1.5 h-4 rounded-full bg-[#198754]"></span>
        <h2 class="text-base sm:text-lg font-bold text-[var(--text-primary)]">
          More Anime to Explore
        </h2>
      </div>
      {#if category}
        <p class="text-xs text-[var(--text-muted)] pl-3.5">
          Popular titles in the <span class="font-semibold text-[var(--text-secondary)]">{category}</span> category
        </p>
      {/if}
    </div>

    {#if loading}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {#each Array(6) as _}
          <AnimeCardSkeleton />
        {/each}
      </div>
    {:else if error}
      <div class="rounded-2xl p-4 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
        Additional exploration titles could not be loaded at this time.
      </div>
    {:else}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {#each items as anime (anime.id)}
          <AnimeCard {anime} />
        {/each}
      </div>
    {/if}
  </section>
{/if}
