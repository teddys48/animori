<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import Badge from '../lib/components/ui/Badge.svelte';
  import Button from '../lib/components/ui/Button.svelte';
  import { jikan } from '../lib/api/jikan';
  import { mapAnime } from '../lib/api/anime';
  import { Resource } from '../lib/api/resource.svelte';
  import type { AnimeItem } from '../lib/types/anime';
  import Skeleton from '../lib/components/ui/Skeleton.svelte';

  interface Props {
    id: number;
  }

  let { id }: Props = $props();

  const resource = new Resource<AnimeItem>();

  $effect(() => {
    document.title = `Anime #${id} — Animori`;
    void resource.load(async () => {
      const raw = await jikan.getAnime(id);
      return mapAnime(raw);
    });
  });

  $effect(() => {
    if (resource.data?.title) {
      document.title = `${resource.data.title} — Animori`;
    }
  });
</script>

<div class="py-12 sm:py-16">
  <Container class="max-w-4xl space-y-8">
    <div class="flex items-center justify-between gap-4">
      <Button href="/anime" variant="secondary" size="sm">
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Catalog
      </Button>

      <Badge variant="accent" size="sm">Phase 3 Preview</Badge>
    </div>

    {#if resource.status === 'loading'}
      <div class="glass-panel p-6 sm:p-10 rounded-3xl border border-[var(--glass-border)] space-y-6 animate-pulse">
        <div class="flex flex-col sm:flex-row gap-6">
          <Skeleton width="w-48" height="h-64" rounded="rounded-2xl" class="shrink-0" />
          <div class="flex-1 space-y-4">
            <Skeleton width="w-3/4" height="h-8" rounded="rounded-lg" />
            <Skeleton width="w-1/2" height="h-4" rounded="rounded" />
            <Skeleton width="w-full" height="h-24" rounded="rounded-xl" />
          </div>
        </div>
      </div>
    {:else if resource.status === 'success' && resource.data}
      {@const anime = resource.data}
      <div class="glass-panel p-6 sm:p-10 rounded-3xl border border-[var(--glass-border)] shadow-xl space-y-6">
        <div class="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
          <img
            src={anime.poster}
            alt={anime.title}
            class="w-48 sm:w-56 aspect-[3/4] object-cover rounded-2xl border border-[var(--glass-border)] shadow-lg mx-auto sm:mx-0"
          />
          <div class="space-y-4 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              {#if anime.score}
                <Badge variant="warning">★ {anime.score.toFixed(2)}</Badge>
              {/if}
              {#if anime.type}
                <Badge variant="default">{anime.type}</Badge>
              {/if}
              {#if anime.status}
                <Badge variant="info">{anime.status}</Badge>
              {/if}
            </div>

            <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {anime.title}
            </h1>
            {#if anime.titleJapanese}
              <p class="text-xs text-[var(--text-muted)] font-medium -mt-2">
                {anime.titleJapanese}
              </p>
            {/if}

            {#if anime.synopsis}
              <p class="text-sm text-[var(--text-secondary)] leading-relaxed">
                {anime.synopsis}
              </p>
            {/if}
          </div>
        </div>

        <div class="rounded-2xl p-4 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Detailed characters, staff, episodes, and trailers will be available in <strong>Phase 3</strong>.</span>
          {#if anime.url}
            <a
              href={anime.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-[#198754] dark:text-[#20c997] hover:underline font-medium shrink-0 ml-4"
            >
              View on MAL ↗
            </a>
          {/if}
        </div>
      </div>
    {:else}
      <div class="glass-panel p-10 rounded-3xl text-center space-y-4 border border-[var(--glass-border)]">
        <h2 class="text-xl font-bold text-[var(--text-primary)]">Anime #{id}</h2>
        <p class="text-sm text-[var(--text-muted)] max-w-md mx-auto">
          Full anime details are coming in Phase 3. You can explore titles via search or the catalog.
        </p>
        <Button href="/anime" variant="primary" size="md">Browse Anime Catalog</Button>
      </div>
    {/if}
  </Container>
</div>
