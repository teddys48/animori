<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';

  interface Props {
    title?: string;
    message?: string;
    retryText?: string;
    onretry?: () => void;
    icon?: Snippet;
    class?: string;
  }

  let {
    title = 'Failed to load content',
    message = 'An unexpected error occurred while fetching anime data. Please check your connection and try again.',
    retryText = 'Try Again',
    onretry,
    icon,
    class: className = ''
  }: Props = $props();
</script>

<div
  class="glass-panel border-red-500/25 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto {className}"
  role="alert"
>
  <div class="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-inner">
    {#if icon}
      {@render icon()}
    {:else}
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    {/if}
  </div>

  <h3 class="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
  <p class="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">{message}</p>

  {#if onretry}
    <Button variant="secondary" size="sm" onclick={onretry} class="border-red-500/30 hover:border-red-500/50">
      <svg class="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {retryText}
    </Button>
  {/if}
</div>
