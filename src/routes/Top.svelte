<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import AnimeResults from '../lib/components/anime/AnimeResults.svelte';
  import Pagination from '../lib/components/ui/Pagination.svelte';
  import { getTopAnime, TOP_CATEGORIES, getTopCategory, PAGE_SIZE, type TopCategory } from '../lib/api/anime';
  import { Resource } from '../lib/api/resource.svelte';
  import { router, parsePage, buildHref } from '../lib/router/router.svelte';
  import type { Paginated, AnimeItem } from '../lib/types/anime';

  let categoryParam = $derived(router.query.get('category'));
  let currentPage = $derived(parsePage(router.query.get('page')));

  let activeCategory: TopCategory = $derived(getTopCategory(categoryParam));

  const resource = new Resource<Paginated<AnimeItem>>();

  $effect(() => {
    const cat = activeCategory;
    const page = currentPage;
    document.title = `${cat.label} — Top Anime — Animori`;
    void resource.load(() => getTopAnime(cat, page));
  });

  function hrefForCategory(catId: string): string {
    return buildHref('/top', {
      category: catId === 'all' ? undefined : catId,
      page: 1
    });
  }

  function hrefForPage(page: number): string {
    return buildHref('/top', {
      category: activeCategory.id === 'all' ? undefined : activeCategory.id,
      page
    });
  }
</script>

<div class="space-y-8 sm:space-y-12 pb-16">
  <!-- Page Header -->
  <PageHeader
    title={activeCategory.label}
    subtitle={activeCategory.description}
    badge="Top Rankings"
    badgeVariant="warning"
  >
    <!-- Category Tabs Navigation -->
    <nav class="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Top Anime Categories">
      {#each TOP_CATEGORIES as cat}
        <a
          href={hrefForCategory(cat.id)}
          class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border {activeCategory.id === cat.id ? 'bg-[#198754] text-white border-[#198754] shadow-xs shadow-[#198754]/30' : 'bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-base)]'}"
          aria-current={activeCategory.id === cat.id ? 'page' : undefined}
        >
          {cat.label}
        </a>
      {/each}
    </nav>
  </PageHeader>

  <!-- Content Container -->
  <Container class="space-y-8">
    <!-- Results Header / Filter Info -->
    {#if resource.status === 'success' && resource.data}
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
        <span>Rankings sorted by community score and popularity</span>
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
      emptyTitle="No top anime found"
      emptyDescription="Could not load the rankings for this category. Please try again."
      label="{activeCategory.label} anime"
    />

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
