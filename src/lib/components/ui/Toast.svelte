<script lang="ts">
  import { toastStore } from '../../stores/toast.svelte';
</script>

{#if toastStore.toasts.length > 0}
  <div
    class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    role="region"
    aria-live="polite"
    aria-label="Notifications"
  >
    {#each toastStore.toasts as toast (toast.id)}
      <div
        class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl glass-panel shadow-2xl border backdrop-blur-xl text-sm font-medium transition-all duration-300 animate-slide-up {toast.type === 'error'
          ? 'border-red-500/40 bg-red-950/80 text-red-200'
          : toast.type === 'warning'
            ? 'border-amber-500/40 bg-amber-950/80 text-amber-200'
            : 'border-[#198754]/50 bg-slate-900/90 text-white dark:bg-[#0a1120]/95'}"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          {#if toast.type === 'error'}
            <svg class="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          {:else if toast.type === 'warning'}
            <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          {:else}
            <svg class="w-4 h-4 text-[#20c997] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
          <span class="truncate">{toast.message}</span>
        </div>

        <button
          type="button"
          onclick={() => toastStore.dismiss(toast.id)}
          class="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  .animate-slide-up {
    animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>
