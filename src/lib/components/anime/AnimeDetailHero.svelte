<script lang="ts">
  import type { AnimeItem } from '../../types/anime';
  import { FALLBACK_POSTER } from '../../api/anime';
  import Badge from '../ui/Badge.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    anime: AnimeItem;
  }

  let { anime }: Props = $props();

  let failedPoster = $state(false);
  let showTrailerModal = $state(false);

  let posterSrc = $derived(failedPoster ? FALLBACK_POSTER : anime.poster);

  function handlePosterError() {
    failedPoster = true;
  }

  let hasEnglishDiff = $derived(
    Boolean(anime.titleEnglish && anime.titleEnglish.toLowerCase() !== anime.title.toLowerCase())
  );
</script>

<!-- Hero Section with atmospheric backdrop -->
<section
  class="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--card-bg)] backdrop-blur-xl shadow-xl transition-all"
  aria-label="Anime Hero Information"
>
  <!-- Background cover image / atmospheric overlay -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    {#if anime.banner}
      <img
        src={anime.banner}
        alt=""
        aria-hidden="true"
        class="w-full h-full object-cover object-center opacity-25 dark:opacity-20 scale-105 blur-md"
      />
    {/if}
    <!-- Gradient overlay ensures top-level contrast in both dark & light modes -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-[var(--bg-primary)]/40 dark:from-[#050811] dark:via-[#050811]/85 dark:to-transparent"
    ></div>
  </div>

  <div class="relative z-10 p-6 sm:p-8 md:p-10">
    <!-- Top Action Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[var(--glass-border)]">
      <Button href="/anime" variant="secondary" size="sm" class="shrink-0">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Catalog
      </Button>

      <div class="flex items-center gap-2">
        {#if anime.youtubeVideoId}
          <button
            type="button"
            onclick={() => (showTrailerModal = true)}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Watch Anime Trailer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Trailer</span>
          </button>
        {/if}

        {#if anime.url}
          <a
            href={anime.url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--glass-bg-subtle)] hover:bg-[var(--glass-bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] text-xs font-medium transition-colors"
          >
            <span>Kitsu</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        {/if}
      </div>
    </div>

    <!-- Main Hero Content: Poster + Title + Metadata -->
    <div class="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 items-start">
      <!-- Poster Artwork -->
      <div class="w-48 sm:w-56 md:w-64 lg:w-72 shrink-0 mx-auto md:mx-0">
        <div class="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-[var(--glass-border)] shadow-2xl bg-[#090e1a]">
          <img
            src={posterSrc}
            alt="Poster of {anime.title}"
            width="300"
            height="400"
            loading="eager"
            decoding="async"
            onerror={handlePosterError}
            class="w-full h-full object-cover object-center"
          />

          {#if anime.score !== null && anime.score > 0}
            <div
              class="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/80 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-md"
              title={anime.scoreRaw ? `Score: ${anime.score.toFixed(1)} / 10 (${anime.scoreRaw})` : `Score: ${anime.score.toFixed(1)}`}
            >
              <svg class="w-3.5 h-3.5 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{anime.score.toFixed(1)}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Hero Header Details -->
      <div class="flex-1 space-y-4 text-left w-full">
        <!-- Badges Row -->
        <div class="flex flex-wrap items-center gap-2">
          {#if anime.type}
            <Badge variant="default" size="sm">{anime.type}</Badge>
          {/if}

          {#if anime.status}
            <Badge
              variant={anime.status === 'Currently Airing' ? 'success' : anime.status === 'Not yet aired' ? 'info' : 'default'}
              size="sm"
            >
              {anime.status}
            </Badge>
          {/if}

          {#if anime.episodes}
            <Badge variant="outline" size="sm">
              {anime.episodes} {anime.episodes === 1 ? 'Episode' : 'Episodes'}
            </Badge>
          {/if}

          {#if anime.duration}
            <Badge variant="outline" size="sm">
              {anime.duration}
            </Badge>
          {/if}

          {#if anime.ageRating}
            <Badge variant="warning" size="sm">
              {anime.ageRating}
            </Badge>
          {/if}
        </div>

        <!-- Titles -->
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
            {anime.title}
          </h1>

          {#if hasEnglishDiff}
            <p class="text-sm sm:text-base font-medium text-[var(--text-secondary)]">
              {anime.titleEnglish}
            </p>
          {/if}

          {#if anime.titleJapanese}
            <p class="text-xs sm:text-sm font-medium text-[var(--text-muted)] font-mono">
              {anime.titleJapanese}
            </p>
          {/if}
        </div>

        <!-- Quick Summary Stats Row -->
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-secondary)] pt-1">
          {#if anime.aired?.label}
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{anime.aired.label}</span>
            </div>
          {/if}

          {#if anime.rank}
            <div class="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 font-semibold">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span>Ranked #{anime.rank}</span>
            </div>
          {/if}

          {#if anime.popularity}
            <div class="flex items-center gap-1.5 text-[#198754] dark:text-[#20c997] font-semibold">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>Popularity #{anime.popularity}</span>
            </div>
          {/if}

          {#if anime.members}
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{anime.members.toLocaleString()} members</span>
            </div>
          {/if}
        </div>

        <!-- Genres Badges -->
        {#if anime.genres && anime.genres.length > 0}
          <div class="pt-2">
            <div class="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-dim)] mb-1.5">
              Genres
            </div>
            <div class="flex flex-wrap gap-1.5">
              {#each anime.genres as genre}
                <span
                  class="text-xs px-2.5 py-1 rounded-xl bg-[var(--tag-bg)] text-[var(--text-secondary)] border border-[var(--tag-border)] font-medium"
                >
                  {genre}
                </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- Trailer Modal if requested -->
{#if showTrailerModal && anime.youtubeVideoId}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    role="dialog"
    aria-modal="true"
    aria-label="Anime Trailer"
  >
    <div class="relative w-full max-w-3xl glass-modal rounded-3xl overflow-hidden border border-white/20 p-2 sm:p-4 shadow-2xl">
      <div class="flex items-center justify-between pb-3 px-2 border-b border-[var(--glass-border)]">
        <h3 class="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
          {anime.title} — Official Trailer
        </h3>
        <button
          type="button"
          onclick={() => (showTrailerModal = false)}
          class="p-1.5 rounded-xl hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
          aria-label="Close trailer modal"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="aspect-video w-full mt-3 rounded-2xl overflow-hidden bg-black">
        <iframe
          src="https://www.youtube-nocookie.com/embed/{anime.youtubeVideoId}?autoplay=1"
          title="{anime.title} Trailer"
          class="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
{/if}
