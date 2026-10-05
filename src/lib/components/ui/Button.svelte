<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    href?: string;
    fullWidth?: boolean;
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    [key: string]: any;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    href,
    fullWidth = false,
    class: className = '',
    onclick,
    children,
    ...restProps
  }: Props = $props();

  const variantClasses = {
    primary: 'bg-[#198754] hover:bg-[#157347] text-white font-medium shadow-sm shadow-[#198754]/25 border border-[#198754]/40 hover:border-[#157347] active:scale-[0.98]',
    secondary: 'bg-[var(--glass-bg-subtle)] hover:bg-[var(--glass-bg-base)] text-[var(--text-primary)] font-medium border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] active:scale-[0.98]',
    glass: 'bg-[var(--glass-bg-base)] hover:bg-[var(--glass-bg-elevated)] text-[var(--text-primary)] font-medium backdrop-blur-md border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] shadow-xs active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] hover:border-[#198754]/60 font-medium active:scale-[0.98]',
    ghost: 'bg-transparent hover:bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium active:scale-[0.98]'
  };

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-4.5 py-2.5 rounded-2xl gap-2',
    lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5'
  };
</script>

{#if href}
  <a
    {href}
    class="inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#198754] {variantClasses[variant]} {sizeClasses[size]} {fullWidth ? 'w-full' : ''} {disabled ? 'opacity-50 pointer-events-none' : ''} {className}"
    {...restProps}
  >
    {#if children}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    {type}
    {disabled}
    {onclick}
    class="inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#198754] {variantClasses[variant]} {sizeClasses[size]} {fullWidth ? 'w-full' : ''} {disabled ? 'opacity-50 cursor-not-allowed' : ''} {className}"
    {...restProps}
  >
    {#if children}
      {@render children()}
    {/if}
  </button>
{/if}
