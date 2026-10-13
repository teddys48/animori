<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import SectionHeader from '../lib/components/ui/SectionHeader.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import Badge from '../lib/components/ui/Badge.svelte';
  import AnimeCard from '../lib/components/anime/AnimeCard.svelte';
  import AnimeCardSkeleton from '../lib/components/anime/AnimeCardSkeleton.svelte';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import ErrorState from '../lib/components/ui/ErrorState.svelte';
  import {
    HERO_FEATURED_ANIME,
    MOCK_POPULAR_ANIME,
    MOCK_AIRING_ANIME,
    MOCK_UPCOMING_ANIME
  } from '../lib/data/mockAnime';
  import { getTopAnime, getSeasonNow, getUpcomingAnime, getAnime } from '../lib/api/anime';
  import { recentStore, recentToAnimeItem } from '../lib/stores/recent.svelte';
  import type { AnimeItem } from '../lib/types/anime';

  // State toggle to demonstrate UI states (Loading, Empty, Error)
  let previewState = $state<'normal' | 'loading' | 'empty' | 'error'>('normal');

  // Spotlight hero anime initialized with valid fallback and upgraded to live Kitsu data
  let heroAnime = $state<AnimeItem>(HERO_FEATURED_ANIME);

  // Homepage sections initialized with baseline data for instant render and offline resilience
  let popularList = $state<AnimeItem[]>(MOCK_POPULAR_ANIME.slice(0, 6));
  let airingList = $state<AnimeItem[]>(MOCK_AIRING_ANIME.slice(0, 6));
  let upcomingList = $state<AnimeItem[]>(MOCK_UPCOMING_ANIME.slice(0, 6));

  let airingSeasonBadge = $state('Season 2025');

  $effect(() => {
    document.title = 'Animori — Anime Discovery & Information';
  });

  // Fetch real Kitsu data for homepage sections independently
  $effect(() => {
    let cancelled = false;

    async function loadRealData() {
      // 0. Fetch real Spotlight anime data from Kitsu
      try {
        const liveHero = await getAnime(46474);
        if (!cancelled && liveHero) {
          heroAnime = {
            ...liveHero,
            title: HERO_FEATURED_ANIME.title,
            titleJapanese: liveHero.titleJapanese || HERO_FEATURED_ANIME.titleJapanese
          };
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[animori] Kitsu hero fetch:', err);
      }

      if (cancelled) return;

      // 1. Fetch Popular Anime from Kitsu
      try {
        const top = await getTopAnime(undefined, 1);
        if (!cancelled && top.items.length > 0) {
          popularList = top.items.slice(0, 6);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[animori] Kitsu popular fetch:', err);
      }

      if (cancelled) return;

      // 2. Fetch Currently Airing Anime from Kitsu
      try {
        const airing = await getSeasonNow(1);
        if (!cancelled && airing.items.length > 0) {
          airingList = airing.items.slice(0, 6);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[animori] Kitsu airing fetch:', err);
      }

      if (cancelled) return;

      // 3. Fetch Upcoming Anime from Kitsu
      try {
        const upcoming = await getUpcomingAnime(1);
        if (!cancelled && upcoming.items.length > 0) {
          upcomingList = upcoming.items.slice(0, 6);
        }
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[animori] Kitsu upcoming fetch:', err);
      }
    }

    void loadRealData();

    return () => {
      cancelled = true;
    };
  });
</script>

<div class="space-y-16 sm:space-y-20 pb-16">
  <!-- ==================== HERO SECTION ==================== -->
  <section class="relative pt-6 sm:pt-10 overflow-hidden" aria-labelledby="hero-title">
    <Container>
      <!-- Hero Glass Card Banner (Consistent glassmorphism for dark & light) -->
      <div class="relative rounded-3xl overflow-hidden glass-panel border border-[var(--glass-border)] shadow-xl">
        <!-- Banner Image Background with Theme-Aware Gradient -->
        <div class="absolute inset-0">
          <img
            src={heroAnime.banner || HERO_FEATURED_ANIME.banner}
            alt="{heroAnime.title} background"
            class="w-full h-full object-cover object-center opacity-25 dark:opacity-30"
            onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div class="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/90 to-transparent"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]/40"></div>
        </div>

        <!-- Hero Content Grid -->
        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          <!-- Left Column: Details -->
          <div class="lg:col-span-8 space-y-5">
            <!-- Badges Bar -->
            <div class="flex flex-wrap items-center gap-2">
              <Badge variant="accent" size="md">
                ✨ Spotlight of the Season
              </Badge>
              <Badge variant="warning" size="md" class="flex items-center gap-1 font-semibold backdrop-blur-md">
                <svg class="w-3.5 h-3.5 fill-[var(--badge-warning-text)] text-[var(--badge-warning-text)]" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {heroAnime.score ?? HERO_FEATURED_ANIME.score} Score
              </Badge>
              <Badge variant="default" size="md">
                {heroAnime.type ?? HERO_FEATURED_ANIME.type} · {heroAnime.episodes ?? HERO_FEATURED_ANIME.episodes} Episodes
              </Badge>
            </div>

            <!-- Title -->
            <div class="space-y-2">
              <h1 id="hero-title" class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight">
                {heroAnime.title}
              </h1>
              {#if heroAnime.titleJapanese}
                <p class="text-sm font-medium text-[var(--text-muted)] tracking-wide">
                  {heroAnime.titleJapanese}
                </p>
              {/if}
            </div>

            <!-- Synopsis snippet -->
            <p class="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {heroAnime.synopsis ?? HERO_FEATURED_ANIME.synopsis}
            </p>

            <!-- Metadata info tags -->
            <div class="flex flex-wrap items-center gap-3 pt-1 text-xs text-[var(--text-secondary)]">
              {#if heroAnime.studios?.length}
                <span class="flex items-center gap-1.5 font-medium">
                  <span class="text-[#198754] dark:text-[#20c997] font-semibold">Studio:</span>
                  {heroAnime.studios.join(', ')}
                </span>
                <span>•</span>
              {/if}
              {#if heroAnime.genres?.length}
                <span class="flex items-center gap-1.5 font-medium">
                  <span class="text-[#198754] dark:text-[#20c997] font-semibold">Genres:</span>
                  {heroAnime.genres.join(', ')}
                </span>
                <span>•</span>
              {/if}
              <span class="flex items-center gap-1.5 font-medium">
                <span class="text-[#198754] dark:text-[#20c997] font-semibold">Status:</span>
                {heroAnime.status ?? HERO_FEATURED_ANIME.status}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-3.5 pt-3">
              <Button
                variant="primary"
                size="md"
                href="/anime/{heroAnime.id}"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </Button>

              <Button
                variant="glass"
                size="md"
                href="/anime"
              >
                Explore Catalog
              </Button>
            </div>
          </div>

          <!-- Right Column: Poster Card Preview (Visible on all screens with responsive scaling) -->
          <div class="flex justify-center items-center lg:col-span-4 mt-2 lg:mt-0">
            <a
              href="/anime/{heroAnime.id}"
              class="group relative block w-52 sm:w-60 lg:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-[var(--glass-border-hover)] bg-[#090e1a] transform lg:rotate-1 lg:hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer"
              aria-label="View {heroAnime.title} details"
            >
              <img
                src={heroAnime.poster || HERO_FEATURED_ANIME.poster}
                alt="{heroAnime.title} showcase"
                class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onerror={(e) => { (e.currentTarget as HTMLImageElement).src = '/fallback-poster.png'; }}
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4 pointer-events-none">
                <div class="text-xs text-white">
                  <span class="font-semibold text-white block">Rank #1 on Kitsu</span>
                  <span class="text-slate-300">All-Time Highest Rated</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Container>
  </section>

  <!-- ==================== UI STATE PREVIEW TOGGLE ==================== -->
  <section class="border-y border-[var(--glass-border)] py-4 bg-[var(--state-container-bg)] transition-colors duration-200">
    <Container>
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <svg class="w-4 h-4 text-[#198754] dark:text-[#20c997]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="font-medium text-[var(--text-primary)]">UI Component States:</span>
          <span>Switch view to inspect built-in states</span>
        </div>

        <div class="flex items-center gap-1.5 bg-[var(--glass-bg-subtle)] p-1.5 rounded-2xl border border-[var(--glass-border)] backdrop-blur-md shadow-xs">
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-xl transition-all duration-200 cursor-pointer {previewState === 'normal' ? 'bg-[#198754] text-white font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
            onclick={() => (previewState = 'normal')}
          >
            Normal View
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-xl transition-all duration-200 cursor-pointer {previewState === 'loading' ? 'bg-[#198754] text-white font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
            onclick={() => (previewState = 'loading')}
          >
            Loading Skeleton
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-xl transition-all duration-200 cursor-pointer {previewState === 'empty' ? 'bg-[#198754] text-white font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
            onclick={() => (previewState = 'empty')}
          >
            Empty State
          </button>
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-xl transition-all duration-200 cursor-pointer {previewState === 'error' ? 'bg-[#198754] text-white font-medium shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
            onclick={() => (previewState = 'error')}
          >
            Error State
          </button>
        </div>
      </div>
    </Container>
  </section>

  <!-- ==================== MAIN CONTENT SECTIONS ==================== -->
  <Container class="space-y-16">
    {#if previewState === 'loading'}
      <!-- Loading Skeleton Preview -->
      <section aria-label="Loading skeleton preview">
        <SectionHeader
          title="Loading Skeleton State"
          subtitle="Smooth placeholder skeletons used while fetching data from Kitsu"
          badge="Demo View"
        />
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {#each Array(6) as _}
            <AnimeCardSkeleton />
          {/each}
        </div>
      </section>
    {:else if previewState === 'empty'}
      <!-- Empty State Preview -->
      <section aria-label="Empty state preview" class="py-8">
        <EmptyState
          title="No Seasonal Anime Matches"
          description="We couldn't find any anime in the current database matching your active genre and year filters."
          actionText="Reset All Filters"
          onaction={() => (previewState = 'normal')}
        />
      </section>
    {:else if previewState === 'error'}
      <!-- Error State Preview -->
      <section aria-label="Error state preview" class="py-8">
        <ErrorState
          title="Unable to Connect to Anime Source"
          message="A network timeout occurred while simulating the data stream. Please check your connectivity and retry."
          retryText="Retry Simulation"
          onretry={() => (previewState = 'normal')}
        />
      </section>
    {:else}
      <!-- ==================== SECTION 1: POPULAR ANIME ==================== -->
      <section id="popular" aria-labelledby="section-popular-title">
        <SectionHeader
          title="Popular Anime"
          subtitle="Top rated masterpieces of all time on Kitsu"
          badge="Top Rated"
          actionText="View All"
          actionHref="/top"
        />

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {#each popularList as anime (anime.id)}
            <AnimeCard {anime} />
          {/each}
        </div>
      </section>

      <!-- ==================== SECTION 2: CURRENTLY AIRING ==================== -->
      <section id="airing" aria-labelledby="section-airing-title">
        <SectionHeader
          title="Currently Airing"
          subtitle="Broadcasts and weekly simulcasts this season"
          badge={airingSeasonBadge}
          badgeVariant="success"
          actionText="View Schedule"
          actionHref="/seasonal"
        />

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {#each airingList as anime (anime.id)}
            <AnimeCard {anime} />
          {/each}
        </div>
      </section>

      <!-- ==================== SECTION 3: UPCOMING ANIME ==================== -->
      <section id="upcoming" aria-labelledby="section-upcoming-title">
        <SectionHeader
          title="Upcoming Releases"
          subtitle="Anticipated series and theatrical movies coming soon"
          badge="Anticipated"
          badgeVariant="info"
          actionText="View Calendar"
          actionHref="/upcoming"
        />

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {#each upcomingList as anime (anime.id)}
            <AnimeCard {anime} />
          {/each}
        </div>
      </section>

      <!-- ==================== SECTION 4: RECENTLY VIEWED ==================== -->
      {#if recentStore.items.length > 0}
        <section id="recent-views" aria-labelledby="section-recent-title">
          <div class="flex items-center justify-between">
            <SectionHeader
              title="Recently Viewed"
              subtitle="Anime titles you recently checked out"
              badge="History"
              badgeVariant="accent"
            />
            <button
              type="button"
              onclick={() => recentStore.clear()}
              class="text-xs text-[var(--text-muted)] hover:text-rose-500 transition-colors font-medium cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 mt-6">
            {#each recentStore.items.slice(0, 6) as item (item.id)}
              {@const anime = recentToAnimeItem(item)}
              <AnimeCard {anime} />
            {/each}
          </div>
        </section>
      {/if}
    {/if}
  </Container>
</div>
