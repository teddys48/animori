<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { AnimeItem } from '../../types/anime';
  import type { ResourceStatus } from '../../api/resource.svelte';
  import { describeError } from '../../api/errors';
  import AnimeGrid from './AnimeGrid.svelte';
  import EmptyState from '../ui/EmptyState.svelte';
  import ErrorState from '../ui/ErrorState.svelte';

  interface Props {
    status: ResourceStatus;
    items?: AnimeItem[];
    error?: unknown;
    onretry?: () => void;
    skeletonCount?: number;
    eagerCount?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    /** Optional custom action rendered inside the empty state. */
    emptyAction?: Snippet;
    label?: string;
  }

  let {
    status,
    items = [],
    error,
    onretry,
    skeletonCount = 12,
    eagerCount = 0,
    emptyTitle = 'No anime available',
    emptyDescription = 'Please try again later.',
    emptyAction,
    label
  }: Props = $props();

  let description = $derived(status === 'error' ? describeError(error) : null);
</script>

{#if status === 'loading' || status === 'idle'}
  <div role="status" aria-live="polite">
    <span class="sr-only">Loading anime…</span>
    <AnimeGrid loading {skeletonCount} {label} />
  </div>
{:else if status === 'error' && description}
  <ErrorState
    title={description.title}
    message={description.message}
    retryText="Try Again"
    onretry={description.retryable ? onretry : undefined}
  />
{:else if items.length === 0}
  <EmptyState title={emptyTitle} description={emptyDescription}>
    {#if emptyAction}{@render emptyAction()}{/if}
  </EmptyState>
{:else}
  <AnimeGrid {items} {eagerCount} {label} />
{/if}
