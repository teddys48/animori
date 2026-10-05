<script lang="ts">
  import Skeleton from '../ui/Skeleton.svelte';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div
  class="flex flex-col rounded-2xl overflow-hidden glass-panel border border-[var(--glass-border)] animate-pulse {className}"
  aria-hidden="true"
>
  <!-- Poster Skeleton -->
  <div class="aspect-[3/4] w-full bg-[var(--skeleton-bg)] relative">
    <div class="absolute top-2.5 left-2.5 w-10 h-5 bg-[var(--skeleton-bg)] rounded-md border border-[var(--glass-border)]"></div>
    <div class="absolute top-2.5 right-2.5 w-12 h-5 bg-[var(--skeleton-bg)] rounded-md border border-[var(--glass-border)]"></div>
  </div>

  <!-- Content Skeleton -->
  <div class="p-3.5 sm:p-4 space-y-3 bg-[var(--card-body-bg)]">
    <Skeleton height="h-4" width="w-4/5" rounded="rounded" />
    <Skeleton height="h-3" width="w-1/2" rounded="rounded" />
    <div class="pt-2 border-t border-[var(--glass-border)] flex gap-1.5">
      <Skeleton height="h-3.5" width="w-12" rounded="rounded" />
      <Skeleton height="h-3.5" width="w-14" rounded="rounded" />
    </div>
  </div>
</div>
