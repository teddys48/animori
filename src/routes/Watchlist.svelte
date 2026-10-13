<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Input from '../lib/components/ui/Input.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import AnimeCard from '../lib/components/anime/AnimeCard.svelte';
  import {
    userLibrary,
    WATCH_STATUSES,
    entryToAnimeItem,
    type WatchStatus,
    type UserAnimeEntry
  } from '../lib/stores/library.svelte';
  import { router, buildHref } from '../lib/router/router.svelte';

  $effect(() => {
    document.title = 'My Watchlist — Animori';
  });

  // URL query parameter for active status tab
  let statusFilter = $derived(router.query.get('status')?.trim() as WatchStatus | undefined);

  let searchQuery = $state('');
  let sortBy = $state<'recent' | 'title' | 'score' | 'year'>('recent');

  function handleTabClick(status?: WatchStatus) {
    const nextHref = buildHref('/watchlist', { status: status || undefined });
    router.navigate(nextHref, { scroll: false });
  }

  let filteredWatchlist = $derived.by(() => {
    let list = userLibrary.watchlist;

    // Filter by tab status
    if (statusFilter) {
      list = list.filter((item) => item.watchStatus === statusFilter);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => item.title.toLowerCase().includes(q));
    }

    // Sort list
    return [...list].sort((a, b) => {
      if (sortBy === 'recent') return b.updatedAt - a.updatedAt;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'score') return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === 'year') return (b.year ?? 0) - (a.year ?? 0);
      return 0;
    });
  });

  let counts = $derived(userLibrary.countsByStatus);
</script>

<div class="space-y-8 sm:space-y-10 pb-16">
  <!-- Page Header -->
  <PageHeader
    title="My Watchlist"
    subtitle="Track anime you plan to watch, are currently watching, or have completed."
    badge={`${userLibrary.countWatchlist} tracked`}
    badgeVariant="accent"
  >
    {#if userLibrary.countWatchlist > 0}
      <!-- Filter and Sort Bar inside Header -->
      <div class="w-full max-w-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <Input
            placeholder="Search within watchlist..."
            bind:value={searchQuery}
            aria-label="Search within watchlist"
            class="py-2.5 text-xs"
          >
            {#snippet leadingIcon()}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            {/snippet}
            {#snippet trailingIcon()}
              {#if searchQuery}
                <button
                  type="button"
                  onclick={() => (searchQuery = '')}
                  class="p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label="Clear filter"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            {/snippet}
          </Input>
        </div>

        <div class="shrink-0 flex items-center gap-2">
          <label for="watch-sort" class="text-xs text-[var(--text-dim)] font-medium">Sort:</label>
          <select
            id="watch-sort"
            bind:value={sortBy}
            class="text-xs px-3 py-2 rounded-xl bg-[var(--glass-bg-base)] border border-[var(--glass-border)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer"
          >
            <option value="recent">Recently Updated</option>
            <option value="title">Title (A-Z)</option>
            <option value="score">Highest Rated</option>
            <option value="year">Release Year</option>
          </select>
        </div>
      </div>
    {/if}
  </PageHeader>

  <Container class="space-y-6">
    <!-- Status Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--glass-border)]" role="tablist" aria-label="Watchlist Status Filters">
      <!-- All Tab -->
      <button
        type="button"
        onclick={() => handleTabClick(undefined)}
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer {!statusFilter
          ? 'bg-[var(--glass-bg-elevated)] text-[var(--text-primary)] border border-[var(--glass-border-hover)] shadow-xs'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)]'}"
        role="tab"
        aria-selected={!statusFilter}
      >
        <span>All</span>
        <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[var(--text-muted)]">
          {userLibrary.countWatchlist}
        </span>
      </button>

      {#each WATCH_STATUSES as statusItem}
        {@const count = counts[statusItem.key]}
        <button
          type="button"
          onclick={() => handleTabClick(statusItem.key)}
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer {statusFilter === statusItem.key
            ? 'bg-[var(--glass-bg-elevated)] text-[var(--text-primary)] border border-[var(--glass-border-hover)] shadow-xs'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)]'}"
          role="tab"
          aria-selected={statusFilter === statusItem.key}
        >
          <span class="w-2 h-2 rounded-full {statusItem.dotColor}"></span>
          <span>{statusItem.label}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-[var(--text-muted)]">
            {count}
          </span>
        </button>
      {/each}
    </div>

    {#if userLibrary.countWatchlist === 0}
      <!-- Empty State: No watchlist items -->
      <EmptyState
        title="Your Watchlist is Empty"
        description="Track what you're watching, plan to watch, or completed. Click the watchlist button on any anime card or detail page to get started."
      >
        <Button href="/anime" variant="primary" size="md">
          Browse Anime Catalog
        </Button>
      </EmptyState>

    {:else if filteredWatchlist.length === 0}
      <!-- Filter Empty State -->
      <EmptyState
        title="No Anime Matches"
        description={searchQuery
          ? `No anime in this section matches "${searchQuery}".`
          : 'No anime currently has this watch status.'}
      >
        {#if searchQuery}
          <Button variant="secondary" size="sm" onclick={() => (searchQuery = '')}>
            Clear Search
          </Button>
        {:else}
          <Button variant="secondary" size="sm" onclick={() => handleTabClick(undefined)}>
            View All Watchlist
          </Button>
        {/if}
      </EmptyState>

    {:else}
      <!-- Watchlist Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--glass-border)]">
          <span>Showing {filteredWatchlist.length} anime</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {#each filteredWatchlist as entry (entry.id)}
            {@const anime = entryToAnimeItem(entry)}
            <AnimeCard {anime} />
          {/each}
        </div>
      </div>
    {/if}
  </Container>
</div>
