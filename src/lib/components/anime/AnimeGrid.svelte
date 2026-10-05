<script lang="ts">
  import type { AnimeItem } from '../../types/anime';
  import AnimeCard from './AnimeCard.svelte';
  import AnimeCardSkeleton from './AnimeCardSkeleton.svelte';

  interface Props {
    items?: AnimeItem[];
    loading?: boolean;
    /** Number of skeleton cards while loading (match the expected page size to avoid layout jumps). */
    skeletonCount?: number;
    /** First N posters load eagerly (above the fold). */
    eagerCount?: number;
    label?: string;
    class?: string;
  }

  let {
    items = [],
    loading = false,
    skeletonCount = 12,
    eagerCount = 0,
    label = 'Anime list',
    class: className = ''
  }: Props = $props();
</script>

<!-- Same column rhythm as the Phase 1 homepage grids -->
<div
  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 {className}"
  aria-label={label}
  aria-busy={loading}
  role="list"
>
  {#if loading}
    {#each Array(skeletonCount) as _, i (i)}
      <div role="listitem" class="flex"><AnimeCardSkeleton class="w-full" /></div>
    {/each}
  {:else}
    {#each items as anime, i (anime.id)}
      <div role="listitem" class="flex"><AnimeCard {anime} eager={i < eagerCount} class="w-full" /></div>
    {/each}
  {/if}
</div>
