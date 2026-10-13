<script lang="ts">
  import type { RelatedAnimeItem } from '../../types/anime';
  import Skeleton from '../ui/Skeleton.svelte';

  interface Props {
    related: RelatedAnimeItem[];
    loading?: boolean;
    error?: unknown;
  }

  let { related, loading = false, error }: Props = $props();

  function getRoleBadgeMeta(role: string): { text: string; border: string; dot: string; bg: string } {
    const r = role.toLowerCase();
    if (r.includes('sequel')) {
      return {
        bg: 'bg-emerald-950/90',
        text: 'text-emerald-300',
        border: 'border-emerald-400/60',
        dot: 'bg-emerald-400'
      };
    }
    if (r.includes('prequel')) {
      return {
        bg: 'bg-sky-950/90',
        text: 'text-sky-300',
        border: 'border-sky-400/60',
        dot: 'bg-sky-400'
      };
    }
    if (r.includes('spin') || r.includes('side')) {
      return {
        bg: 'bg-purple-950/90',
        text: 'text-purple-200',
        border: 'border-purple-400/60',
        dot: 'bg-purple-400'
      };
    }
    if (r.includes('alt') || r.includes('summary')) {
      return {
        bg: 'bg-amber-950/90',
        text: 'text-amber-300',
        border: 'border-amber-400/60',
        dot: 'bg-amber-400'
      };
    }
    return {
      bg: 'bg-slate-950/90',
      text: 'text-slate-100',
      border: 'border-white/30',
      dot: 'bg-white'
    };
  }
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
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
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
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
        {#each related as item (item.id)}
          {@const roleMeta = getRoleBadgeMeta(item.role)}
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

              <!-- Role Badge (High contrast solid dark pill with luminous accent) -->
              <div class="absolute top-2.5 left-2.5 pointer-events-none">
                <div
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg {roleMeta.bg} {roleMeta.text} border {roleMeta.border} text-[11px] font-bold shadow-lg shadow-black/60 backdrop-blur-md select-none tracking-wide shrink-0"
                >
                  <span class="w-1.5 h-1.5 rounded-full {roleMeta.dot} shrink-0 shadow-xs"></span>
                  <span>{item.role}</span>
                </div>
              </div>

              <!-- Score if available -->
              {#if item.score}
                <div class="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/85 border border-amber-400/60 text-amber-300 text-xs font-bold shadow-md shadow-black/50 backdrop-blur-md pointer-events-none shrink-0">
                  <span>★ {item.score.toFixed(1)}</span>
                </div>
              {/if}
            </div>

            <!-- Content -->
            <div class="p-3 bg-[var(--card-body-bg)] flex-1 flex flex-col justify-between space-y-1.5">
              <h3
                class="font-semibold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-[#198754] dark:group-hover:text-[#20c997] transition-colors line-clamp-2 leading-snug"
                title={item.title}
              >
                {item.title}
              </h3>

              <div class="flex items-center justify-between text-[11px] pt-1">
                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--glass-bg-elevated)] border border-[var(--glass-border)] text-[var(--text-primary)] font-semibold shadow-2xs">
                  {item.type || 'Anime'}
                </span>
                {#if item.year}
                  <span class="font-medium text-[var(--text-secondary)]">{item.year}</span>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
{/if}
