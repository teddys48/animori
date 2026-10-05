<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    size = 'xl',
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };
</script>

<div
  class="w-full mx-auto px-4 sm:px-6 lg:px-8 {sizeClasses[size]} {className}"
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</div>
