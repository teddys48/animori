<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    interactive?: boolean;
    elevated?: boolean;
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    interactive = false,
    elevated = false,
    class: className = '',
    children,
    ...restProps
  }: Props = $props();
</script>

<div
  class="rounded-2xl transition-all duration-300 relative overflow-hidden {elevated ? 'glass-panel-elevated' : 'glass-panel'} {interactive ? 'glass-interactive cursor-pointer hover:-translate-y-1' : ''} {className}"
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</div>
