<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import AnimeResults from '../lib/components/anime/AnimeResults.svelte';
  import Pagination from '../lib/components/ui/Pagination.svelte';
  import { getUpcomingAnime, PAGE_SIZE } from '../lib/api/anime';
  import { Resource } from '../lib/api/resource.svelte';
  import { router, parsePage, buildHref } from '../lib/router/router.svelte';
  import type { Paginated, AnimeItem } from '../lib/types/anime';

  let currentPage = $derived(parsePage(router.query.get('page')));

  const resource = new Resource<Paginated<AnimeItem>>();

  $effect(() => {
    const page = currentPage;
    document.title = 'Upcoming Anime Releases — Animori';
    void resource.load(() => getUpcomingAnime(page));
  });

  function hrefForPage(page: number): string {
    return buildHref('/upcoming', { page });
  }
</script>

<div class="space-y-8 sm:space-y-12 pb-16">
  <!-- Page Header -->
  <PageHeader
    title="Upcoming Anime"
    subtitle="Anticipated new franchises, sequel seasons, and theatrical movies scheduled for future premiere."
    badge="Coming Soon"
    badgeVariant="info"
  />

  <!-- Content Container -->
  <Container class="space-y-8">
    <!-- Results Header / Filter Info -->
    {#if resource.status === 'success' && resource.data}
      <div class="flex items-center justify-between gap-2 pb-2 border-b border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
        <span>Upcoming releases officially confirmed on MyAnimeList</span>
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
      emptyTitle="No upcoming anime found"
      emptyDescription="No upcoming titles were returned from the database. Please try again later."
      label="Upcoming anime releases"
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
