<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Input from '../lib/components/ui/Input.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import AnimeResults from '../lib/components/anime/AnimeResults.svelte';
  import Pagination from '../lib/components/ui/Pagination.svelte';
  import { searchAnime, getTopAnime, PAGE_SIZE } from '../lib/api/anime';
  import { Resource } from '../lib/api/resource.svelte';
  import { router, parsePage, buildHref } from '../lib/router/router.svelte';
  import type { Paginated, AnimeItem } from '../lib/types/anime';

  // URL state is the single source of truth
  let queryParam = $derived(router.query.get('q')?.trim() ?? '');
  let currentPage = $derived(parsePage(router.query.get('page')));

  // Local input value synchronized with query parameter
  let searchInput = $state('');

  $effect(() => {
    searchInput = queryParam;
  });

  const resource = new Resource<Paginated<AnimeItem>>();

  // Load data whenever query or page changes
  $effect(() => {
    const q = queryParam;
    const page = currentPage;

    if (q) {
      document.title = `"${q}" — Search Anime — Animori`;
      void resource.load(() => searchAnime(q, page));
    } else {
      document.title = `Anime Catalog & Search — Animori`;
      void resource.load(() => getTopAnime(undefined, page));
    }
  });

  function handleSubmit(e?: Event) {
    if (e) e.preventDefault();
    const term = searchInput.trim();
    if (term) {
      router.navigate(buildHref('/anime', { q: term, page: 1 }));
    } else {
      router.navigate('/anime');
    }
  }

  function handleClear() {
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
      page
    });
  }
</script>

<div class="space-y-8 sm:space-y-12 pb-16">
  <!-- Page Header -->
  <PageHeader
    title={queryParam ? `Search: "${queryParam}"` : 'Anime Catalog'}
    subtitle={queryParam
      ? `Results from the Jikan anime database for "${queryParam}"`
      : 'Explore all-time top anime, search titles, and discover your next favorite series.'}
    badge={queryParam ? 'Search' : 'Catalog'}
    badgeVariant={queryParam ? 'info' : 'accent'}
  >
    <!-- Search Bar Form -->
    <form onsubmit={handleSubmit} class="w-full max-w-2xl">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div class="relative flex-1">
          <Input
            placeholder="Search anime by title (e.g. Frieren, Naruto, One Piece)..."
            bind:value={searchInput}
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
                  onclick={handleClear}
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

  <!-- Content Container -->
  <Container class="space-y-8">
    <!-- Results Header / Filter Info -->
    {#if resource.status === 'success' && resource.data}
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
        <div>
          {#if queryParam}
            <span>Showing results for <span class="font-semibold text-[var(--text-primary)]">"{queryParam}"</span></span>
            {#if resource.data.pageInfo.total}
              <span class="ml-1.5">({resource.data.pageInfo.total} titles found)</span>
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
      emptyTitle={queryParam ? `No anime found for "${queryParam}"` : 'No anime available'}
      emptyDescription={queryParam
        ? 'Try another search term, check spelling, or browse the all-time catalog.'
        : 'Please try again in a few moments.'}
      label={queryParam ? `Search results for ${queryParam}` : 'Anime catalog'}
    >
      {#snippet emptyAction()}
        {#if queryParam}
          <Button variant="glass" size="sm" onclick={handleClear}>
            View All Anime
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
