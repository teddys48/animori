<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';

  interface Props {
    title?: string;
    description?: string;
    actionText?: string;
    onaction?: () => void;
    icon?: Snippet;
    children?: Snippet;
    class?: string;
  }

  let {
    title = 'No anime found',
    description = 'We couldn\'t find any titles matching your criteria. Try adjusting your filters.',
    actionText,
    onaction,
    icon,
    children,
    class: className = ''
  }: Props = $props();
</script>

<div
  class="glass-panel rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto {className}"
>
  <div class="w-14 h-14 rounded-2xl bg-[#198754]/15 border border-[#198754]/30 flex items-center justify-center text-[#198754] dark:text-[#20c997] mb-4 shadow-inner">
    {#if icon}
      {@render icon()}
    {:else}
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
      </svg>
    {/if}
  </div>

  <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
  <p class="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">{description}</p>

  {#if children}
    {@render children()}
  {:else if actionText}
    <Button variant="glass" size="sm" onclick={onaction}>
      {actionText}
    </Button>
  {/if}
</div>
