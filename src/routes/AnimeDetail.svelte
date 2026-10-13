<script lang="ts">
  import { onDestroy } from 'svelte';
  import Container from '../lib/components/ui/Container.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import ErrorState from '../lib/components/ui/ErrorState.svelte';
  import Skeleton from '../lib/components/ui/Skeleton.svelte';
  import AnimeDetailHero from '../lib/components/anime/AnimeDetailHero.svelte';
  import AnimeMetadata from '../lib/components/anime/AnimeMetadata.svelte';
  import AnimeSynopsis from '../lib/components/anime/AnimeSynopsis.svelte';
  import AnimeCharacters from '../lib/components/anime/AnimeCharacters.svelte';
  import AnimeRelated from '../lib/components/anime/AnimeRelated.svelte';
  import AnimeRecommendations from '../lib/components/anime/AnimeRecommendations.svelte';
  import {
    getAnime,
    getAnimeCharacters,
    getAnimeRelated,
    getMoreAnimeToExplore,
    FALLBACK_POSTER
  } from '../lib/api/anime';
  import { Resource } from '../lib/api/resource.svelte';
  import { describeError } from '../lib/api/errors';
  import { setDocumentMeta } from '../lib/utils/seo';
  import type { AnimeItem, CharacterItem, RelatedAnimeItem } from '../lib/types/anime';

  interface Props {
    id: number | string;
  }

  let { id }: Props = $props();

  // Validate ID format (must be a positive integer)
  let idString = $derived(String(id).trim());
  let isValidId = $derived(/^\d+$/.test(idString) && parseInt(idString, 10) > 0);
  let numericId = $derived(isValidId ? parseInt(idString, 10) : null);

  // Independent resources so secondary data doesn't block the primary page
  const animeResource = new Resource<AnimeItem>();
  const charactersResource = new Resource<CharacterItem[]>();
  const relatedResource = new Resource<RelatedAnimeItem[]>();
  const exploreResource = new Resource<AnimeItem[]>();

  let metaCleanup: (() => void) | null = null;

  onDestroy(() => {
    if (metaCleanup) {
      metaCleanup();
      metaCleanup = null;
    }
  });

  // Load main anime resource whenever ID changes
  $effect(() => {
    const curId = numericId;

    if (!isValidId || curId === null) {
      document.title = 'Invalid Anime ID — Animori';
      return;
    }

    document.title = `Loading Anime #${curId} — Animori`;

    // Load primary anime
    void animeResource.load(async () => {
      return getAnime(curId);
    });

    // Concurrently load characters
    void charactersResource.load(async () => {
      return getAnimeCharacters(curId);
    });

    // Concurrently load related anime
    void relatedResource.load(async () => {
      return getAnimeRelated(curId);
    });
  });

  // When primary anime loads successfully, update SEO meta & load category recommendations
  $effect(() => {
    if (animeResource.data) {
      const anime = animeResource.data;

      if (metaCleanup) metaCleanup();
      metaCleanup = setDocumentMeta({
        title: anime.title,
        description: anime.synopsis || `Discover details, ratings, and characters for ${anime.title} on Animori.`,
        image: anime.poster && anime.poster !== FALLBACK_POSTER ? anime.poster : undefined,
        url: window.location.href
      });

      // Load "More Anime to Explore" if categories or genres exist
      const primaryCategory = anime.categories?.[0] || anime.genres?.[0];
      if (primaryCategory) {
        void exploreResource.load(async () => {
          return getMoreAnimeToExplore(primaryCategory, anime.id, 6);
        });
      }
    }
  });

  let errorDesc = $derived(
    animeResource.error ? describeError(animeResource.error) : null
  );

  let isNotFound = $derived(
    (animeResource.error as any)?.kind === 'not-found' ||
    (animeResource.error as any)?.status === 404
  );
</script>

<div class="py-8 sm:py-12 space-y-8 sm:space-y-10">
  <Container class="space-y-8">
    {#if !isValidId}
      <!-- Invalid Anime ID State -->
      <div class="glass-panel p-8 sm:p-12 rounded-3xl border border-[var(--glass-border)] text-center max-w-lg mx-auto space-y-4">
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto shadow-inner">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-[var(--text-primary)]">Invalid Anime ID</h2>
        <p class="text-sm text-[var(--text-muted)] leading-relaxed">
          The requested anime ID <span class="font-mono text-[var(--text-secondary)]">"{id}"</span> is invalid. Anime IDs must be positive integers from the Kitsu database.
        </p>
        <div class="pt-2">
          <Button href="/anime" variant="primary" size="md">Browse Anime Catalog</Button>
        </div>
      </div>
    {:else if animeResource.status === 'loading'}
      <!-- Polished Full-Page Loading Skeleton (Zero layout shifts) -->
      <div class="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading anime information">
        <!-- Hero Skeleton -->
        <div class="glass-panel p-6 sm:p-10 rounded-3xl border border-[var(--glass-border)] space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-[var(--glass-border)]">
            <Skeleton width="w-32" height="h-9" rounded="rounded-xl" />
            <Skeleton width="w-20" height="h-9" rounded="rounded-xl" />
          </div>

          <div class="flex flex-col md:flex-row gap-6 md:gap-10">
            <Skeleton width="w-48 sm:w-56 md:w-64" height="h-72 sm:h-80 md:h-96" rounded="rounded-2xl" class="shrink-0 mx-auto md:mx-0" />
            <div class="flex-1 space-y-4 pt-2">
              <div class="flex gap-2">
                <Skeleton width="w-16" height="h-6" rounded="rounded-full" />
                <Skeleton width="w-24" height="h-6" rounded="rounded-full" />
                <Skeleton width="w-20" height="h-6" rounded="rounded-full" />
              </div>
              <Skeleton width="w-3/4" height="h-10" rounded="rounded-xl" />
              <Skeleton width="w-1/2" height="h-5" rounded="rounded-lg" />
              <Skeleton width="w-2/3" height="h-4" rounded="rounded" />
              <div class="pt-4 flex gap-2">
                <Skeleton width="w-16" height="h-6" rounded="rounded-lg" />
                <Skeleton width="w-20" height="h-6" rounded="rounded-lg" />
                <Skeleton width="w-18" height="h-6" rounded="rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <!-- Content Layout Skeleton -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-4 space-y-6">
            <div class="glass-panel p-6 rounded-3xl border border-[var(--glass-border)] space-y-4">
              <Skeleton width="w-28" height="h-5" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
            </div>
          </div>
          <div class="lg:col-span-8 space-y-8">
            <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--glass-border)] space-y-4">
              <Skeleton width="w-32" height="h-6" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
              <Skeleton width="w-3/4" height="h-4" rounded="rounded" />
            </div>
          </div>
        </div>
      </div>
    {:else if isNotFound}
      <!-- Dedicated 404 Anime Not Found State -->
      <div class="glass-panel p-8 sm:p-14 rounded-3xl border border-[var(--glass-border)] text-center max-w-lg mx-auto space-y-5">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto shadow-inner">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-extrabold text-[var(--text-primary)]">Anime Not Found</h2>
          <p class="text-sm text-[var(--text-muted)] leading-relaxed">
            We couldn't find an anime with ID <span class="font-mono text-[var(--text-secondary)] font-semibold">#{numericId}</span> in the Kitsu database. It may have been removed or does not exist.
          </p>
        </div>
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button href="/anime" variant="primary" size="md">Browse Anime Catalog</Button>
          <Button href="/" variant="secondary" size="md">Go to Homepage</Button>
        </div>
      </div>
    {:else if animeResource.status === 'error'}
      <!-- Network / Server Error with Retry -->
      <ErrorState
        title={errorDesc?.title || 'Unable to Load Anime Details'}
        message={errorDesc?.message || 'A network error occurred while loading anime information.'}
        onretry={errorDesc?.retryable ? animeResource.retry : undefined}
      />
    {:else if animeResource.status === 'success' && animeResource.data}
      <!-- Successfully Loaded Anime Detail Content -->
      {@const anime = animeResource.data}

      <!-- 1. Hero Section -->
      <AnimeDetailHero {anime} />

      <!-- 2. Two-Column Information & Content Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left Sidebar: Quick Facts & Metadata -->
        <div class="lg:col-span-4 space-y-6">
          <AnimeMetadata {anime} />
        </div>

        <!-- Right Main Column: Synopsis, Characters, Related, Explore -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Synopsis -->
          <AnimeSynopsis synopsis={anime.synopsis} />

          <!-- Characters & Voice Actors -->
          <AnimeCharacters
            characters={charactersResource.data || []}
            loading={charactersResource.status === 'loading'}
            error={charactersResource.error}
          />

          <!-- Related Anime (Sequels, Prequels, Side Stories, etc.) -->
          <AnimeRelated
            related={relatedResource.data || []}
            loading={relatedResource.status === 'loading'}
            error={relatedResource.error}
          />

          <!-- More Anime to Explore (from same category) -->
          {#if anime.categories?.[0] || anime.genres?.[0]}
            <AnimeRecommendations
              items={exploreResource.data || []}
              category={anime.categories?.[0] || anime.genres?.[0]}
              loading={exploreResource.status === 'loading'}
              error={exploreResource.error}
            />
          {/if}
        </div>
      </div>
    {/if}
  </Container>
</div>
