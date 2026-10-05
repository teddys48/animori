<script lang="ts">
  import type { Snippet } from 'svelte';
  import Badge from './Badge.svelte';

  interface Props {
    title: string;
    subtitle?: string;
    badge?: string;
    badgeVariant?: 'accent' | 'default' | 'success' | 'warning' | 'info';
    children?: Snippet;
    actions?: Snippet;
    class?: string;
  }

  let {
    title,
    subtitle,
    badge,
    badgeVariant = 'accent',
    children,
    actions,
    class: className = ''
  }: Props = $props();
</script>

<div class="relative py-8 sm:py-10 border-b border-[var(--glass-border)] bg-[var(--state-container-bg)] transition-colors duration-200 {className}">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="space-y-2">
        {#if badge}
          <div class="inline-flex items-center">
            <Badge variant={badgeVariant} size="sm">{badge}</Badge>
          </div>
        {/if}
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        {#if subtitle}
          <p class="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        {/if}
      </div>

      {#if actions}
        <div class="flex items-center gap-2.5 shrink-0">
          {@render actions()}
        </div>
      {/if}
    </div>

    {#if children}
      <div class="mt-6 pt-4 border-t border-[var(--glass-border)]">
        {@render children()}
      </div>
    {/if}
  </div>
</div>
