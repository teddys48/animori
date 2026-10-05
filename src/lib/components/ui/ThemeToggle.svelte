<script lang="ts">
  import { themeManager } from '../../stores/theme.svelte';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<button
  type="button"
  class="relative inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-base)] backdrop-blur-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#198754] select-none cursor-pointer shadow-sm {className}"
  onclick={() => themeManager.toggleTheme()}
  aria-label="Switch to {themeManager.current === 'dark' ? 'light' : 'dark'} mode"
  title="Switch to {themeManager.current === 'dark' ? 'light' : 'dark'} mode"
>
  {#if themeManager.current === 'dark'}
    <!-- Sun icon for Dark Mode (click to switch to Light) -->
    <svg
      class="w-4.5 h-4.5 text-amber-300 transition-transform duration-300 rotate-0 hover:rotate-45"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  {:else}
    <!-- Moon icon for Light Mode (click to switch to Dark) -->
    <svg
      class="w-4.5 h-4.5 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  {/if}
  <span class="sr-only">Toggle theme</span>
</button>
