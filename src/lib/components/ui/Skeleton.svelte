<script lang="ts">
  interface Props {
    width?: string;
    height?: string;
    rounded?: string;
    class?: string;
    aspectRatio?: string;
  }

  let {
    width = 'w-full',
    height = 'h-4',
    rounded = 'rounded-md',
    class: className = '',
    aspectRatio
  }: Props = $props();
</script>

<div
  class="animate-pulse bg-[var(--skeleton-bg)] border border-[var(--glass-border)] {width} {height} {rounded} {aspectRatio ? aspectRatio : ''} {className}"
  aria-hidden="true"
></div>
