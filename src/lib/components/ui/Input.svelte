<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    type?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
    class?: string;
    leadingIcon?: Snippet;
    trailingIcon?: Snippet;
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onkeydown?: (e: KeyboardEvent) => void;
    [key: string]: any;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    id,
    name,
    class: className = '',
    leadingIcon,
    trailingIcon,
    oninput,
    onkeydown,
    ...restProps
  }: Props = $props();
</script>

<div class="relative flex items-center w-full">
  {#if leadingIcon}
    <div class="absolute left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
      {@render leadingIcon()}
    </div>
  {/if}

  <input
    {type}
    {id}
    {name}
    bind:value
    {placeholder}
    {disabled}
    {oninput}
    {onkeydown}
    class="w-full bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm rounded-2xl border border-[var(--input-border)] backdrop-blur-md px-4 py-2.5 transition-all duration-200 focus:outline-none focus:border-[#198754] focus:ring-2 focus:ring-[#198754]/25 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs {leadingIcon ? 'pl-10' : ''} {trailingIcon ? 'pr-10' : ''} {className}"
    {...restProps}
  />

  {#if trailingIcon}
    <div class="absolute right-3.5 flex items-center text-[var(--text-muted)]">
      {@render trailingIcon()}
    </div>
  {/if}
</div>
