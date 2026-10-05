<script lang="ts">
  import type { Snippet } from 'svelte';
  import Badge from './Badge.svelte';

  interface Props {
    title: string;
    subtitle?: string;
    badge?: string;
    badgeVariant?: 'accent' | 'default' | 'success' | 'warning' | 'info';
    actionText?: string;
    actionHref?: string;
    onaction?: () => void;
    action?: Snippet;
    class?: string;
  }

  let {
    title,
    subtitle,
    badge,
    badgeVariant = 'accent',
    actionText,
    actionHref = '#',
    onaction,
    action,
    class: className = ''
  }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 {className}">
  <div class="space-y-1">
    <div class="flex items-center gap-2.5">
      {#if badge}
        <Badge variant={badgeVariant}>{badge}</Badge>
      {/if}
      <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
        <span class="w-1.5 h-5 rounded-full bg-[#198754] inline-block"></span>
        {title}
      </h2>
    </div>
    {#if subtitle}
      <p class="text-xs sm:text-sm text-[var(--text-muted)] pl-3.5">{subtitle}</p>
    {/if}
  </div>

  {#if action}
    <div>{@render action()}</div>
  {:else if actionText}
    <a
      href={actionHref}
      onclick={(e) => {
        if (onaction) {
          e.preventDefault();
          onaction();
        }
      }}
      class="inline-flex items-center text-xs sm:text-sm font-medium text-[#198754] dark:text-[#20c997] hover:text-[#157347] dark:hover:text-[#28a745] transition-colors group cursor-pointer"
    >
      <span>{actionText}</span>
      <svg
        class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  {/if}
</div>
