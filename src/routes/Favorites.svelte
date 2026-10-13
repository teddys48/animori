<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import PageHeader from '../lib/components/ui/PageHeader.svelte';
  import Input from '../lib/components/ui/Input.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import EmptyState from '../lib/components/ui/EmptyState.svelte';
  import AnimeCard from '../lib/components/anime/AnimeCard.svelte';
  import { userLibrary, entryToAnimeItem, type UserAnimeEntry } from '../lib/stores/library.svelte';

  $effect(() => {
    document.title = 'My Favorites — Animori';
  });

  let searchQuery = $state('');
  let sortBy = $state<'recent' | 'title' | 'score' | 'year'>('recent');

  let filteredFavorites = $derived.by(() => {
    let list = userLibrary.favorites;

    // Filter by query
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
</script>

<div class="space-y-8 sm:space-y-10 pb-16">
  <!-- Page Header -->
  <PageHeader
    title="My Favorites"
    subtitle="Your personal collection of saved favorite anime titles."
    badge={`${userLibrary.countFavorites} saved`}
    badgeVariant="accent"
  >
    {#if userLibrary.countFavorites > 0}
      <!-- Filter and Sort Bar inside Header -->
      <div class="w-full max-w-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <Input
            placeholder="Search within favorites..."
            bind:value={searchQuery}
            aria-label="Search within favorites"
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
          <label for="fav-sort" class="text-xs text-[var(--text-dim)] font-medium">Sort:</label>
          <select
            id="fav-sort"
            bind:value={sortBy}
            class="text-xs px-3 py-2 pr-7 rounded-xl bg-[var(--glass-bg-base)] dark:bg-[#0c1222] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[#198754] cursor-pointer shadow-xs transition-colors [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-[#0c1222] dark:[&>option]:text-slate-100"
          >
            <option value="recent">Recently Added</option>
            <option value="title">Title (A-Z)</option>
            <option value="score">Highest Rated</option>
            <option value="year">Release Year</option>
          </select>
        </div>
      </div>
    {/if}
  </PageHeader>

  <Container>
    {#if userLibrary.countFavorites === 0}
      <!-- Empty State: No favorites saved yet -->
      <EmptyState
        title="No Favorites Yet"
        description="You haven't marked any anime as favorite. Explore the catalog and click the heart icon on any anime card or detail page to save it here."
      >
        <Button href="/anime" variant="primary" size="md">
          Browse Anime Catalog
        </Button>
      </EmptyState>

    {:else if filteredFavorites.length === 0}
      <!-- Filter Empty State -->
      <EmptyState
        title="No Matches in Favorites"
        description={`No saved favorite matches "${searchQuery}".`}
      >
        <Button variant="secondary" size="sm" onclick={() => (searchQuery = '')}>
          Clear Search
        </Button>
      </EmptyState>

    {:else}
      <!-- Favorites Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--glass-border)]">
          <span>Showing {filteredFavorites.length} of {userLibrary.countFavorites} favorites</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {#each filteredFavorites as entry (entry.id)}
            {@const anime = entryToAnimeItem(entry)}
            <AnimeCard {anime} />
          {/each}
        </div>
      </div>
    {/if}
  </Container>
</div>
