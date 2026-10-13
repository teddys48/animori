<script lang="ts">
  import type { RelatedAnimeItem } from '../../types/anime';
  import Badge from '../ui/Badge.svelte';
  import Skeleton from '../ui/Skeleton.svelte';

  interface Props {
    related: RelatedAnimeItem[];
    loading?: boolean;
    error?: unknown;
  }

  let { related, loading = false, error }: Props = $props();
</script>

{#if !loading && !error && related.length === 0}
  <!-- Omit section if no related anime exist -->
{:else}
  <section class="space-y-4" aria-label="Related Anime">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-4 rounded-full bg-[#198754]"></span>
      <h2 class="text-base sm:text-lg font-bold text-[var(--text-primary)]">
        Related Anime
      </h2>
      {#if related.length > 0}
        <span class="text-xs text-[var(--text-muted)] font-medium">
          ({related.length})
        </span>
      {/if}
    </div>

    {#if loading}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
        {#each Array(4) as _}
          <div class="glass-panel rounded-2xl overflow-hidden border border-[var(--glass-border)] animate-pulse">
            <Skeleton width="w-full" height="h-36 sm:h-44" rounded="rounded-none" />
            <div class="p-3 space-y-2">
              <Skeleton width="w-16" height="h-4" rounded="rounded" />
              <Skeleton width="w-full" height="h-4" rounded="rounded" />
            </div>
          </div>
        {/each}
      </div>
    {:else if error}
      <div class="rounded-2xl p-4 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
        Related anime information is currently unavailable.
      </div>
    {:else}
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
        {#each related as item (item.id)}
          <a
            href="/anime/{item.id}"
            class="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--glass-border)] hover:border-[#198754]/70 transition-all duration-300 hover:shadow-md hover:shadow-[#198754]/15 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198754]"
          >
            <!-- Media Poster -->
            <div class="relative aspect-[3/4] w-full overflow-hidden bg-[#090e1a]">
              <img
                src={item.poster}
                alt={item.title}
                loading="lazy"
                class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none"></div>

              <!-- Role Badge -->
              <div class="absolute top-2 left-2">
                <Badge
                  variant={item.role === 'Sequel' ? 'accent' : item.role === 'Prequel' ? 'info' : 'default'}
                  size="sm"
                  class="bg-black/70 text-white backdrop-blur-md shadow-sm border-white/20 text-[10px]"
                >
                  {item.role}
                </Badge>
              </div>

              <!-- Score if available -->
              {#if item.score}
                <div class="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/70 text-amber-300 text-[10px] font-bold">
                  <span>★ {item.score.toFixed(1)}</span>
                </div>
              {/if}
            </div>

            <!-- Content -->
            <div class="p-3 bg-[var(--card-body-bg)] flex-1 flex flex-col justify-between space-y-1">
              <h3
                class="font-semibold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-[#198754] dark:group-hover:text-[#20c997] transition-colors line-clamp-2 leading-snug"
                title={item.title}
              >
                {item.title}
              </h3>

              <div class="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1">
                <span>{item.type || 'Anime'}</span>
                {#if item.year}
                  <span>{item.year}</span>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
{/if}
