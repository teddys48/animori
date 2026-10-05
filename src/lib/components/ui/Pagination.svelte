<script lang="ts">
  interface Props {
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
    /** Builds the URL for a page so pagination is link-based (shareable, back/forward friendly). */
    hrefFor: (page: number) => string;
    class?: string;
  }

  let { currentPage, lastPage, hasNextPage, hrefFor, class: className = '' }: Props = $props();

  let total = $derived(Math.max(lastPage, currentPage));
  let hasPrev = $derived(currentPage > 1);
  let hasNext = $derived(hasNextPage || currentPage < lastPage);

  /** Compact window: first, last, current ±1, with ellipses for gaps. */
  let pages = $derived.by(() => {
    const candidates = [1, currentPage - 1, currentPage, currentPage + 1, total];
    const unique = [...new Set(candidates.filter((p) => p >= 1 && p <= total))].sort((a, b) => a - b);
    const result: (number | 'gap')[] = [];
    unique.forEach((page, i) => {
      const prev = unique[i - 1];
      if (prev !== undefined && page - prev > 1) {
        // Show the single missing page instead of an ellipsis when only one is skipped.
        result.push(page - prev === 2 ? prev + 1 : 'gap');
      }
      result.push(page);
    });
    return result;
  });

  const base =
    'inline-flex items-center justify-center h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-medium border transition-all duration-200 select-none';
  const idle =
    'bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] border-[var(--glass-border)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-base)] backdrop-blur-md focus-visible:outline-2 focus-visible:outline-[#198754]';
  const active = 'bg-[#198754] text-white border-[#198754] shadow-sm shadow-[#198754]/25';
  const disabled = 'bg-transparent text-[var(--text-dim)] border-[var(--glass-border)] opacity-50 cursor-not-allowed';
</script>

{#if total > 1}
  <nav class="flex flex-col items-center gap-3 {className}" aria-label="Pagination">
    <ul class="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
      <li>
        {#if hasPrev}
          <a href={hrefFor(currentPage - 1)} class="{base} {idle}" rel="prev" aria-label="Previous page">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline ml-1">Prev</span>
          </a>
        {:else}
          <span class="{base} {disabled}" aria-disabled="true" aria-label="Previous page (unavailable)">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline ml-1">Prev</span>
          </span>
        {/if}
      </li>

      {#each pages as page, i (page === 'gap' ? `gap-${i}` : page)}
        <li>
          {#if page === 'gap'}
            <span class="inline-flex items-center justify-center h-8 sm:h-9 min-w-6 text-[var(--text-dim)]" aria-hidden="true">…</span>
          {:else if page === currentPage}
            <span class="{base} {active}" aria-current="page" aria-label="Page {page}">{page}</span>
          {:else}
            <a href={hrefFor(page)} class="{base} {idle}" aria-label="Page {page}">{page}</a>
          {/if}
        </li>
      {/each}

      <li>
        {#if hasNext}
          <a href={hrefFor(currentPage + 1)} class="{base} {idle}" rel="next" aria-label="Next page">
            <span class="hidden sm:inline mr-1">Next</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        {:else}
          <span class="{base} {disabled}" aria-disabled="true" aria-label="Next page (unavailable)">
            <span class="hidden sm:inline mr-1">Next</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        {/if}
      </li>
    </ul>
    <p class="text-xs text-[var(--text-muted)]">Page {currentPage} of {total}</p>
  </nav>
{/if}
