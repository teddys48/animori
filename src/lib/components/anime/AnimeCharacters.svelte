<script lang="ts">
  import type { CharacterItem } from '../../types/anime';
  import Badge from '../ui/Badge.svelte';
  import Skeleton from '../ui/Skeleton.svelte';

  interface Props {
    characters: CharacterItem[];
    loading?: boolean;
    error?: unknown;
  }

  let { characters, loading = false, error }: Props = $props();

  let showAll = $state(false);
  const INITIAL_LIMIT = 6;

  let displayedCharacters = $derived(
    showAll ? characters : characters.slice(0, INITIAL_LIMIT)
  );

  let hasMore = $derived(characters.length > INITIAL_LIMIT);
</script>

<section class="space-y-4" aria-label="Characters & Voice Actors">
  <div class="flex items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-4 rounded-full bg-[#198754]"></span>
      <h2 class="text-base sm:text-lg font-bold text-[var(--text-primary)]">
        Characters & Voice Actors
      </h2>
      {#if characters.length > 0}
        <span class="text-xs text-[var(--text-muted)] font-medium">
          ({characters.length})
        </span>
      {/if}
    </div>

    {#if hasMore}
      <button
        type="button"
        onclick={() => (showAll = !showAll)}
        class="text-xs font-semibold text-[#198754] dark:text-[#20c997] hover:underline cursor-pointer"
      >
        {showAll ? 'Show Less' : `View All (${characters.length})`}
      </button>
    {/if}
  </div>

  {#if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      {#each Array(6) as _}
        <div class="glass-panel p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 animate-pulse border border-[var(--glass-border)]">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <Skeleton width="w-12 sm:w-14" height="h-16 sm:h-18" rounded="rounded-xl" class="shrink-0" />
            <div class="space-y-2 min-w-0 flex-1">
              <Skeleton width="w-24" height="h-3.5" rounded="rounded" />
              <Skeleton width="w-14" height="h-3" rounded="rounded" />
            </div>
          </div>
          <div class="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
            <div class="space-y-2 min-w-0 flex-1 flex flex-col items-end">
              <Skeleton width="w-20" height="h-3.5" rounded="rounded" />
              <Skeleton width="w-12" height="h-3" rounded="rounded" />
            </div>
            <Skeleton width="w-12 sm:w-14" height="h-16 sm:h-18" rounded="rounded-xl" class="shrink-0" />
          </div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="rounded-2xl p-4 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-xs text-[var(--text-muted)]">
      Character information is currently unavailable for this title.
    </div>
  {:else if characters.length === 0}
    <div class="rounded-2xl p-6 bg-[var(--glass-bg-subtle)] border border-[var(--glass-border)] text-center text-xs text-[var(--text-muted)]">
      No character or voice actor records found for this anime.
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
      {#each displayedCharacters as char (char.id)}
        {@const primaryVa = char.voiceActors[0]}
        <div
          class="glass-panel p-3 sm:p-3.5 rounded-2xl border border-[var(--glass-border)] hover:border-[#198754]/50 transition-all flex items-center justify-between gap-3 group relative overflow-hidden"
        >
          <!-- Left side: Character (strictly takes left half without invading right side) -->
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <!-- Character Avatar -->
            <div class="w-12 h-16 sm:w-13 sm:h-17 shrink-0 rounded-xl overflow-hidden bg-[#090e1a] border border-[var(--glass-border)] relative flex items-center justify-center shadow-xs">
              <!-- Placeholder silhouette always sitting underneath -->
              <div class="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                <svg class="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {#if char.image}
                <img
                  src={char.image}
                  alt={char.name}
                  loading="lazy"
                  class="relative z-1 w-full h-full object-cover object-top"
                  onerror={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              {/if}
            </div>

            <!-- Character Details -->
            <div class="min-w-0 flex-1 space-y-1">
              <h4
                class="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#198754] dark:group-hover:text-[#20c997] transition-colors truncate"
                title={char.name}
              >
                {char.name}
              </h4>
              <div class="flex items-center">
                <Badge
                  variant={char.role === 'Main' ? 'accent' : 'outline'}
                  size="sm"
                  class="text-[10px] px-1.5 py-0 inline-flex shrink-0 font-medium"
                >
                  {char.role}
                </Badge>
              </div>
            </div>
          </div>

          <!-- Right side: Primary Voice Actor (strictly takes right half, text-right) -->
          {#if primaryVa}
            <div class="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
              <!-- Voice Actor Details -->
              <div class="min-w-0 flex-1 space-y-0.5">
                <p
                  class="text-xs sm:text-sm font-medium text-[var(--text-primary)] truncate"
                  title={primaryVa.name}
                >
                  {primaryVa.name}
                </p>
                <p class="text-[10px] text-[var(--text-muted)] font-medium truncate">
                  {primaryVa.language || 'Voice'}
                </p>
              </div>

              <!-- Voice Actor Avatar -->
              <div class="w-12 h-16 sm:w-13 sm:h-17 shrink-0 rounded-xl overflow-hidden bg-[#090e1a] border border-[var(--glass-border)] relative flex items-center justify-center shadow-xs">
                <!-- Placeholder microphone/avatar icon -->
                <div class="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                  <svg class="w-5 h-5 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>

                {#if primaryVa.image}
                  <img
                    src={primaryVa.image}
                    alt={primaryVa.name}
                    loading="lazy"
                    class="relative z-1 w-full h-full object-cover object-top"
                    onerror={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>
