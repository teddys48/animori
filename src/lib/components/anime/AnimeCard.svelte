<script lang="ts">
  import type { AnimeItem } from '../../types/anime';
  import { FALLBACK_POSTER } from '../../api/anime';
  import Badge from '../ui/Badge.svelte';

  interface Props {
    anime: AnimeItem;
    featured?: boolean;
    /** Set for above-the-fold cards to skip lazy loading. */
    eager?: boolean;
    class?: string;
  }

  let { anime, featured = false, eager = false, class: className = '' }: Props = $props();

  // If the Jikan poster fails, try the local fallback once; if that fails too, show the icon state.
  let failedSrc = $state<string | null>(null);
  let imgError = $derived(failedSrc === FALLBACK_POSTER);
  let src = $derived(failedSrc && failedSrc === anime.poster ? FALLBACK_POSTER : anime.poster);

  function handleImageError() {
    failedSrc = src;
  }

  const STATUS_LABEL: Record<string, { text: string; dot: string }> = {
    'Currently Airing': { text: 'Airing', dot: 'bg-emerald-500' },
    'Finished Airing': { text: 'Finished', dot: 'bg-slate-400' },
    'Not yet aired': { text: 'Upcoming', dot: 'bg-sky-500' }
  };

  let isUpcoming = $derived(anime.status === 'Not yet aired');
  let statusInfo = $derived(anime.status ? STATUS_LABEL[anime.status] : undefined);
  let dateLabel = $derived(
    isUpcoming ? (anime.airedShort ?? 'TBA') : (anime.year ? String(anime.year) : (anime.airedShort ?? 'TBA'))
  );
  let altText = $derived(`Poster of ${anime.title}`);
</script>

<article
  class="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--card-bg)] backdrop-blur-md border border-[var(--glass-border)] hover:border-[#198754]/70 transition-all duration-300 hover:shadow-md hover:shadow-[#198754]/15 hover:-translate-y-1 select-none {className}"
>
  <!-- Card Media / Poster (Solid & normal for crisp visual focus in both themes) -->
  <div class="relative aspect-[3/4] w-full overflow-hidden bg-[#090e1a]">
    {#if !imgError}
      <img
        {src}
        alt={altText}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        width="225"
        height="300"
        onerror={handleImageError}
        class="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      />
    {:else}
      <!-- Image fallback state -->
      <div class="flex h-full w-full flex-col items-center justify-center p-4 text-center text-slate-500" role="img" aria-label="{anime.title} — poster unavailable">
        <svg class="h-10 w-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">No Image</span>
      </div>
    {/if}

    <!-- Subtle bottom gradient overlay strictly for overlay readability -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none"></div>

    <!-- Top floating badges: Type & Score -->
    <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
      {#if anime.type}
        <Badge variant="default" size="sm" class="bg-black/60 text-white border-white/20 backdrop-blur-md">
          {anime.type}
        </Badge>
      {:else}
        <span></span>
      {/if}

      {#if anime.score !== null && anime.score > 0}
        <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/70 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-sm" aria-label="Score {anime.score.toFixed(2)}">
          <svg class="w-3 h-3 fill-amber-400 text-amber-400" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{anime.score.toFixed(1)}</span>
        </div>
      {:else if isUpcoming}
        <Badge variant="accent" size="sm" class="bg-[#198754]/40 text-white border-[#198754]/50">
          Upcoming
        </Badge>
      {:else}
        <Badge variant="default" size="sm" class="bg-black/60 text-white/80 border-white/20 backdrop-blur-md">
          N/A
        </Badge>
      {/if}
    </div>

    <!-- Bottom overlay info on poster (Year / Aired date + Episodes) -->
    <div class="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 text-[11px] text-white/90 font-medium pointer-events-none">
      <span class="truncate">{dateLabel}</span>
      {#if anime.episodes}
        <span class="text-white/80 shrink-0">{anime.episodes} eps</span>
      {/if}
    </div>
  </div>

  <!-- Card Body Content -->
  <div class="flex flex-col flex-1 p-3.5 sm:p-4 justify-between bg-[var(--card-body-bg)]">
    <div class="space-y-1.5">
      <h3
        class="font-semibold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[#198754] dark:group-hover:text-[#20c997] transition-colors line-clamp-2 leading-snug"
        title={anime.title}
      >
        {anime.title}
      </h3>

      {#if statusInfo || (anime.studios && anime.studios.length > 0)}
        <p class="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] min-w-0">
          {#if statusInfo}
            <span class="inline-flex items-center gap-1 shrink-0">
              <span class="w-1.5 h-1.5 rounded-full {statusInfo.dot}" aria-hidden="true"></span>
              {statusInfo.text}
            </span>
          {/if}
          {#if statusInfo && anime.studios && anime.studios.length > 0}
            <span aria-hidden="true">·</span>
          {/if}
          {#if anime.studios && anime.studios.length > 0}
            <span class="truncate">{anime.studios.join(', ')}</span>
          {/if}
        </p>
      {/if}
    </div>

    <!-- Genres / Tags -->
    {#if anime.genres && anime.genres.length > 0}
      <div class="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-[var(--glass-border)]">
        {#each anime.genres.slice(0, 2) as genre}
          <span class="text-[10px] px-2 py-0.5 rounded-lg bg-[var(--tag-bg)] text-[var(--text-secondary)] border border-[var(--tag-border)]">
            {genre}
          </span>
        {/each}
        {#if anime.genres.length > 2}
          <span class="text-[10px] text-[var(--text-dim)] self-center">
            +{anime.genres.length - 2}
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Accessible Link Overlay -->
  <a
    href="/anime/{anime.id}"
    class="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198754] rounded-2xl"
    aria-label="View details for {anime.title}"
  >
    <span class="sr-only">View {anime.title} details</span>
  </a>
</article>
