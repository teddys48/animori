<script lang="ts">
  interface Props {
    synopsis?: string;
  }

  let { synopsis }: Props = $props();

  let expanded = $state(false);

  const LONG_THRESHOLD = 420;
  let isLong = $derived(Boolean(synopsis && synopsis.length > LONG_THRESHOLD));

  let displaySynopsis = $derived.by(() => {
    if (!synopsis) return '';
    if (!isLong || expanded) return synopsis;
    return synopsis.slice(0, LONG_THRESHOLD).trim() + '...';
  });
</script>

<div class="glass-panel p-6 sm:p-8 rounded-3xl border border-[var(--glass-border)] space-y-4">
  <div class="flex items-center gap-2">
    <span class="w-1.5 h-4 rounded-full bg-[#198754]"></span>
    <h2 class="text-base sm:text-lg font-bold text-[var(--text-primary)]">Synopsis</h2>
  </div>

  {#if synopsis}
    <div class="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line space-y-3">
      {displaySynopsis}
    </div>

    {#if isLong}
      <button
        type="button"
        onclick={() => (expanded = !expanded)}
        class="inline-flex items-center gap-1 text-xs font-semibold text-[#198754] dark:text-[#20c997] hover:underline cursor-pointer focus:outline-none"
      >
        <span>{expanded ? 'Show Less' : 'Read More'}</span>
        <svg
          class="w-3.5 h-3.5 transition-transform {expanded ? 'rotate-180' : ''}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    {/if}
  {:else}
    <p class="text-sm text-[var(--text-muted)] italic">
      No synopsis available for this title yet.
    </p>
  {/if}
</div>
