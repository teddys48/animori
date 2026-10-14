<script lang="ts">
  import { onDestroy } from 'svelte';
  import Container from '../lib/components/ui/Container.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Input from '../lib/components/ui/Input.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import AnimeResults from '../lib/components/anime/AnimeResults.svelte';
  import Pagination from '../lib/components/ui/Pagination.svelte';
  import {
    discoverAnime,
    PAGE_SIZE,
    TYPE_OPTIONS,
    STATUS_OPTIONS,
    CATEGORY_OPTIONS,
    SEASON_OPTIONS,
    SORT_OPTIONS
  } from '../lib/api/anime';
  import { Resource } from '../lib/api/resource.svelte';
  import { router, parsePage, buildHref } from '../lib/router/router.svelte';
  import type { Paginated, AnimeItem } from '../lib/types/anime';

  // URL query parameters are the single source of truth
  let queryParam = $derived(router.query.get('q')?.trim() ?? '');
  let typeParam = $derived(router.query.get('type')?.trim() ?? '');
  let statusParam = $derived(router.query.get('status')?.trim() ?? '');
  let categoryParam = $derived(router.query.get('category')?.trim() ?? '');
  let yearParam = $derived(router.query.get('year')?.trim() ?? '');
  let seasonParam = $derived(router.query.get('season')?.trim() ?? '');
  let sortParam = $derived(router.query.get('sort')?.trim() ?? '');
  let currentPage = $derived(parsePage(router.query.get('page')));

  // Local input value synchronized with URL query parameter
  let searchInput = $state('');

  // Sync search input when URL changes externally (back/forward or navigation)
  $effect(() => {
    searchInput = queryParam;
  });

  // Debounced search input handler
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  onDestroy(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  function handleInputChange(newVal: string) {
    searchInput = newVal;
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== queryParam) {
        updateFilter({ q: trimmed || null, page: 1 }, { replace: true });
      }
    }, 400);
  }

  const resource = new Resource<Paginated<AnimeItem>>();

  // Load data whenever any URL parameter changes
  $effect(() => {
    const q = queryParam;
    const type = typeParam;
    const status = statusParam;
    const category = categoryParam;
    const year = yearParam;
    const season = seasonParam;
    const sort = sortParam;
    const page = currentPage;

    if (q) {
      document.title = `"${q}" — Search Anime — Animori`;
    } else if (category || type || status) {
      document.title = `Browse Anime Catalog — Animori`;
    } else {
      document.title = `Anime Catalog & Search — Animori`;
    }

    void resource.load((signal) =>
      discoverAnime({
        query: q || undefined,
        type: type || undefined,
        status: status || undefined,
        category: category || undefined,
        seasonYear: year || undefined,
        season: season || undefined,
        sort: sort || undefined,
        page,
        signal
      })
    );
  });

  function updateFilter(
    updates: Record<string, string | number | null | undefined>,
    options: { replace?: boolean } = {}
  ) {
    const currentParams: Record<string, string | number | null | undefined> = {
      q: queryParam || undefined,
      type: typeParam || undefined,
      status: statusParam || undefined,
      category: categoryParam || undefined,
      year: yearParam || undefined,
      season: seasonParam || undefined,
      sort: sortParam && sortParam !== 'popular' ? sortParam : undefined,
      page: currentPage > 1 ? currentPage : undefined
    };

    const nextParams = { ...currentParams, ...updates };

    for (const [k, v] of Object.entries(nextParams)) {
      if (v === null || v === undefined || v === '') {
        delete nextParams[k];
      }
    }
    if (nextParams.page === 1 || nextParams.page === '1') {
      delete nextParams.page;
    }
    if (nextParams.sort === 'popular') {
      delete nextParams.sort;
    }

    const nextHref = buildHref('/anime', nextParams);
    router.navigate(nextHref, { replace: options.replace ?? false, scroll: !options.replace });
  }

  function handleSubmit(e?: Event) {
    if (e) e.preventDefault();
    if (debounceTimer) clearTimeout(debounceTimer);
    const term = searchInput.trim();
    updateFilter({ q: term || null, page: 1 }, { replace: false });
  }

  function handleClearSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    searchInput = '';
    updateFilter({ q: null, page: 1 }, { replace: false });
  }

  function handleResetAllFilters() {
    if (debounceTimer) clearTimeout(debounceTimer);
    searchInput = '';
    router.navigate('/anime');
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  function hrefForPage(page: number): string {
    return buildHref('/anime', {
      q: queryParam || undefined,
      type: typeParam || undefined,
      status: statusParam || undefined,
      category: categoryParam || undefined,
      year: yearParam || undefined,
      season: seasonParam || undefined,
      sort: sortParam && sortParam !== 'popular' ? sortParam : undefined,
      page: page > 1 ? page : undefined
    });
  }

  // Active filter count and labels for chips
  let activeFiltersCount = $derived(
    (typeParam ? 1 : 0) +
      (statusParam ? 1 : 0) +
      (categoryParam ? 1 : 0) +
      (yearParam ? 1 : 0) +
      (seasonParam ? 1 : 0) +
      (sortParam && sortParam !== 'popular' ? 1 : 0)
  );

  let activeTypeLabel = $derived(TYPE_OPTIONS.find((t) => t.id === typeParam)?.label);
  let activeStatusLabel = $derived(STATUS_OPTIONS.find((s) => s.id === statusParam)?.label);
  let activeCategoryLabel = $derived(CATEGORY_OPTIONS.find((c) => c.id === categoryParam)?.label);
  let activeSeasonLabel = $derived(SEASON_OPTIONS.find((s) => s.id === seasonParam)?.label);
  let activeSortLabel = $derived(SORT_OPTIONS.find((s) => s.id === sortParam)?.label);

  const YEAR_OPTIONS = [
    2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010, 2005, 2000, 1990
  ];
</script>

<div class="space-y-8 sm:space-y-10 pb-16">
  <!-- Page Header -->
  <PageHeader
    title={queryParam ? `Search: "${queryParam}"` : 'Anime Catalog'}
    subtitle={queryParam
      ? `Search results for "${queryParam}"`
      : 'Filter by format, genre, status, season, and sort to discover your next favorite series.'}
    badge={queryParam ? 'Search' : 'Discovery'}
    badgeVariant={queryParam ? 'info' : 'accent'}
  >
    <!-- Search Bar Form -->
    <form onsubmit={handleSubmit} class="w-full max-w-2xl">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div class="relative flex-1">
          <Input
            placeholder="Search anime by title (e.g. Frieren, Naruto, One Piece)..."
            bind:value={searchInput}
            oninput={(e: Event) => handleInputChange((e.target as HTMLInputElement).value)}
            onkeydown={handleKeyDown}
            aria-label="Search anime titles"
            class="py-3 text-sm pr-10"
          >
            {#snippet leadingIcon()}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            {/snippet}
            {#snippet trailingIcon()}
              {#if searchInput}
                <button
                  type="button"
                  onclick={handleClearSearch}
                  class="p-1 rounded-lg hover:bg-[var(--glass-bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            {/snippet}
          </Input>
        </div>

        <Button type="submit" variant="primary" size="md" class="shrink-0 px-6">
          <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </Button>
      </div>
    </form>
  </PageHeader>

  <!-- Filter Controls Container -->
  <Container class="space-y-6">
    <!-- Filter Bar Card -->
    <div class="p-4 sm:p-5 rounded-3xl glass-panel border border-[var(--glass-border)] shadow-sm space-y-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-[#198754] dark:text-[#20c997]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Filter & Sort</span>
          {#if activeFiltersCount > 0}
            <span class="px-2 py-0.5 rounded-full bg-[#198754]/20 text-[#198754] dark:text-[#20c997] text-[11px] font-bold">
              {activeFiltersCount} active
            </span>
          {/if}
        </div>

        <div>
          {#if activeFiltersCount > 0 || queryParam}
            <button
              type="button"
              onclick={handleResetAllFilters}
              class="text-xs text-[var(--text-muted)] hover:text-rose-500 transition-colors font-medium cursor-pointer"
            >
              Reset All
            </button>
          {/if}
        </div>
      </div>

      <!-- Filter Controls Grid: Always visible in clean responsive layout -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <!-- 1. Format / Subtype -->
        <div class="space-y-1">
          <label for="filter-type" class="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
            Format
          </label>
          <select
            id="filter-type"
            value={typeParam}
            onchange={(e) => updateFilter({ type: (e.target as HTMLSelectElement).value || null, page: 1 })}
            class="w-full text-xs px-2.5 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            <option value="" selected={!typeParam}>All Formats</option>
            {#each TYPE_OPTIONS as opt}
              <option value={opt.id} selected={opt.id === typeParam}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <!-- 2. Status -->
        <div class="space-y-1">
          <label for="filter-status" class="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
            Status
          </label>
          <select
            id="filter-status"
            value={statusParam}
            onchange={(e) => updateFilter({ status: (e.target as HTMLSelectElement).value || null, page: 1 })}
            class="w-full text-xs px-2.5 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            <option value="" selected={!statusParam}>All Statuses</option>
            {#each STATUS_OPTIONS as opt}
              <option value={opt.id} selected={opt.id === statusParam}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <!-- 3. Genre / Category -->
        <div class="space-y-1">
          <label for="filter-category" class="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
            Genre
          </label>
          <select
            id="filter-category"
            value={categoryParam}
            onchange={(e) => updateFilter({ category: (e.target as HTMLSelectElement).value || null, page: 1 })}
            class="w-full text-xs px-2.5 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            <option value="" selected={!categoryParam}>All Genres</option>
            {#each CATEGORY_OPTIONS as opt}
              <option value={opt.id} selected={opt.id === categoryParam}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <!-- 4. Season -->
        <div class="space-y-1">
          <label for="filter-season" class="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
            Season
          </label>
          <select
            id="filter-season"
            value={seasonParam}
            onchange={(e) => updateFilter({ season: (e.target as HTMLSelectElement).value || null, page: 1 })}
            class="w-full text-xs px-2.5 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            <option value="" selected={!seasonParam}>All Seasons</option>
            {#each SEASON_OPTIONS as opt}
              <option value={opt.id} selected={opt.id === seasonParam}>{opt.label}</option>
            {/each}
          </select>
        </div>

        <!-- 5. Year -->
        <div class="space-y-1">
          <label for="filter-year" class="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
            Year
          </label>
          <select
            id="filter-year"
            value={yearParam}
            onchange={(e) => updateFilter({ year: (e.target as HTMLSelectElement).value || null, page: 1 })}
            class="w-full text-xs px-2.5 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            <option value="" selected={!yearParam}>All Years</option>
            {#each YEAR_OPTIONS as yr}
              <option value={yr} selected={String(yr) === yearParam}>{yr}</option>
            {/each}
          </select>
        </div>

        <!-- 6. Sort -->
        <div class="space-y-1">
          <label for="filter-sort" class="block text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider">
            Sort By
          </label>
          <select
            id="filter-sort"
            value={sortParam || 'popular'}
            onchange={(e) => updateFilter({ sort: (e.target as HTMLSelectElement).value || null, page: 1 })}
            class="w-full text-xs px-2.5 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            {#each SORT_OPTIONS as opt}
              <option value={opt.id} selected={opt.id === (sortParam || 'popular')}>{opt.label}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Active Filter Chips Bar -->
      {#if activeFiltersCount > 0}
        <div class="pt-2 border-t border-[var(--glass-border)] flex flex-wrap items-center gap-1.5 text-xs">
          <span class="text-[11px] text-[var(--text-dim)] font-medium mr-1">Active:</span>

          {#if typeParam}
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <span>Format: {activeTypeLabel || typeParam}</span>
              <button
                type="button"
                onclick={() => updateFilter({ type: null, page: 1 })}
                class="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Remove format filter"
              >
                ×
              </button>
            </span>
          {/if}

          {#if statusParam}
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <span>Status: {activeStatusLabel || statusParam}</span>
              <button
                type="button"
                onclick={() => updateFilter({ status: null, page: 1 })}
                class="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Remove status filter"
              >
                ×
              </button>
            </span>
          {/if}

          {#if categoryParam}
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <span>Genre: {activeCategoryLabel || categoryParam}</span>
              <button
                type="button"
                onclick={() => updateFilter({ category: null, page: 1 })}
                class="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Remove genre filter"
              >
                ×
              </button>
            </span>
          {/if}

          {#if seasonParam}
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <span>Season: {activeSeasonLabel || seasonParam}</span>
              <button
                type="button"
                onclick={() => updateFilter({ season: null, page: 1 })}
                class="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Remove season filter"
              >
                ×
              </button>
            </span>
          {/if}

          {#if yearParam}
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <span>Year: {yearParam}</span>
              <button
                type="button"
                onclick={() => updateFilter({ year: null, page: 1 })}
                class="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Remove year filter"
              >
                ×
              </button>
            </span>
          {/if}

          {#if sortParam && sortParam !== 'popular'}
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-[var(--text-primary)]">
              <span>Sort: {activeSortLabel || sortParam}</span>
              <button
                type="button"
                onclick={() => updateFilter({ sort: null, page: 1 })}
                class="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Reset sort"
              >
                ×
              </button>
            </span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Results Header / Filter Info -->
    {#if resource.status === 'success' && resource.data}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
        <div>
          {#if queryParam}
            <span>Showing results for <span class="font-semibold text-[var(--text-primary)]">"{queryParam}"</span></span>
            {#if resource.data.pageInfo.total}
              <span class="ml-1.5">({resource.data.pageInfo.total.toLocaleString()} titles found)</span>
            {/if}
          {:else if activeFiltersCount > 0}
            <span>Filtered catalog results</span>
            {#if resource.data.pageInfo.total}
              <span class="ml-1.5">({resource.data.pageInfo.total.toLocaleString()} titles)</span>
            {/if}
          {:else}
            <span>All-time top anime catalog</span>
          {/if}
        </div>
        <span class="text-[var(--text-dim)]">Page {currentPage} of {resource.data.pageInfo.lastPage}</span>
      </div>
    {/if}

    <!-- Anime Results: Loading / Error / Empty / Grid -->
    <AnimeResults
      status={resource.status}
      items={resource.data?.items}
      error={resource.error}
      onretry={resource.retry}
      skeletonCount={PAGE_SIZE}
      eagerCount={6}
      emptyTitle={queryParam
        ? `No anime found for "${queryParam}"`
        : activeFiltersCount > 0
          ? 'No anime matches the selected filters'
          : 'No anime available'}
      emptyDescription={queryParam || activeFiltersCount > 0
        ? 'Try removing some filters, checking spelling, or resetting your search to explore the catalog.'
        : 'Please try again in a few moments.'}
      label={queryParam ? `Search results for ${queryParam}` : 'Anime catalog'}
    >
      {#snippet emptyAction()}
        {#if queryParam || activeFiltersCount > 0}
          <Button variant="glass" size="sm" onclick={handleResetAllFilters}>
            Reset All Filters
          </Button>
        {/if}
      {/snippet}
    </AnimeResults>

    <!-- Pagination -->
    {#if resource.status === 'success' && resource.data && resource.data.pageInfo.lastPage > 1}
      <div class="pt-6 border-t border-[var(--glass-border)]">
        <Pagination
          currentPage={resource.data.pageInfo.currentPage}
          lastPage={resource.data.pageInfo.lastPage}
          hasNextPage={resource.data.pageInfo.hasNextPage}
          hrefFor={hrefForPage}
        />
      </div>
    {/if}
  </Container>
</div>
