<script lang="ts">
  import type { Snippet } from 'svelte';
  import Navbar from './Navbar.svelte';
  import Footer from './Footer.svelte';

  interface Props {
    activeRoute?: string;
    children?: Snippet;
  }

  let { activeRoute = 'Home', children }: Props = $props();
</script>

<div class="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[#198754] selection:text-white transition-colors duration-200 overflow-x-hidden w-full">
  <!-- Top Global Navigation -->
  <Navbar {activeRoute} />

  <!-- Main Content Area -->
  <main class="flex-1 w-full" id="main-content">
    {#if children}
      {@render children()}
    {/if}
  </main>

  <!-- Global Footer -->
  <Footer />
</div>
