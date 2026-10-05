<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'accent' | 'default' | 'success' | 'warning' | 'info' | 'outline';
    size?: 'sm' | 'md';
    class?: string;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = 'default',
    size = 'sm',
    class: className = '',
    children,
    ...restProps
  }: Props = $props();

  const variantClasses = {
    accent: 'badge-accent border',
    default: 'badge-default border',
    success: 'badge-success border',
    warning: 'badge-warning border',
    info: 'badge-info border',
    outline: 'badge-outline border'
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-lg gap-1',
    md: 'text-xs px-3 py-1 rounded-xl gap-1.5'
  };
</script>

<span
  class="inline-flex items-center justify-center tracking-wide backdrop-blur-md select-none transition-colors duration-200 {variantClasses[variant]} {sizeClasses[size]} {className}"
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</span>
