<script lang="ts">
  import Input from '../components/ui/Input.svelte';
  import Badge from '../components/ui/Badge.svelte';
  import ThemeToggle from '../components/ui/ThemeToggle.svelte';

  interface Props {
    activeRoute?: string;
  }

  let { activeRoute = 'Home' }: Props = $props();

  let isMobileMenuOpen = $state(false);
  let searchQuery = $state('');

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Anime', href: '#popular' },
    { name: 'Top', href: '#popular' },
    { name: 'Seasonal', href: '#airing' }
  ];

  function toggleMobileMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;
  }
</script>

<header class="sticky top-0 z-50 w-full border-b border-[var(--glass-border)] bg-[var(--nav-bg)] backdrop-blur-xl transition-colors duration-200 shadow-sm">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between gap-3 sm:gap-4">
      <!-- Brand Logo -->
      <a href="/" class="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198754] rounded-xl p-1">
        <div class="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#198754] via-[#20c997] to-cyan-400 shadow-sm shadow-[#198754]/30 group-hover:shadow-[#198754]/50 transition-shadow">
          <svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[#198754] transition-colors">
            Ani<span class="text-[#198754] dark:text-[#20c997]">mori</span>
          </span>
          <span class="text-[9px] uppercase tracking-wider text-[var(--text-muted)] -mt-1 font-semibold">Anime Discovery</span>
        </div>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Main Navigation">
        {#each navLinks as link}
          <a
            href={link.href}
            class="px-3.5 py-1.5 rounded-xl transition-all duration-200 {activeRoute === link.name ? 'text-[var(--text-primary)] bg-[var(--glass-bg-elevated)] font-semibold border border-[var(--glass-border-hover)] shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)]'}"
          >
            {link.name}
          </a>
        {/each}
      </nav>

      <!-- Search UI Placeholder (Phase 1 placeholder) -->
      <div class="hidden sm:flex items-center flex-1 max-w-xs md:max-w-sm lg:max-w-md mx-2">
        <div class="w-full relative">
          <Input
            placeholder="Search anime, genres, studios... (Phase 2)"
            bind:value={searchQuery}
            aria-label="Search anime placeholder"
            class="py-2 text-xs"
          >
            {#snippet leadingIcon()}
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            {/snippet}
            {#snippet trailingIcon()}
              <kbd class="hidden lg:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--kbd-bg)] border border-[var(--glass-border)] rounded-lg">
                ⌘K
              </kbd>
            {/snippet}
          </Input>
        </div>
      </div>

      <!-- Action area: Status Badge + Theme Toggle -->
      <div class="hidden sm:flex items-center gap-2.5">
        <Badge variant="accent" size="sm">
          Phase 1 UI Shell
        </Badge>
        <ThemeToggle />
      </div>

      <!-- Mobile Right Controls: Theme Toggle + Menu Button -->
      <div class="flex items-center gap-1.5 sm:hidden">
        <ThemeToggle />
        <button
          type="button"
          class="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)] border border-transparent hover:border-[var(--glass-border)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#198754]"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle navigation menu"
          onclick={toggleMobileMenu}
        >
          {#if isMobileMenuOpen}
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Drawer Menu -->
  {#if isMobileMenuOpen}
    <div class="sm:hidden border-t border-[var(--glass-border)] bg-[var(--nav-bg)] backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 shadow-lg">
      <!-- Search Input on mobile -->
      <div class="w-full">
        <Input
          placeholder="Search anime... (Phase 2)"
          bind:value={searchQuery}
          aria-label="Search anime placeholder mobile"
          class="py-2 text-xs"
        >
          {#snippet leadingIcon()}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          {/snippet}
        </Input>
      </div>

      <!-- Nav Links -->
      <nav class="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
        {#each navLinks as link}
          <a
            href={link.href}
            onclick={() => (isMobileMenuOpen = false)}
            class="px-3.5 py-2.5 rounded-2xl text-base font-medium transition-colors {activeRoute === link.name ? 'bg-[#198754]/20 text-[#198754] dark:text-[#20c997] font-semibold border border-[#198754]/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-subtle)]'}"
          >
            {link.name}
          </a>
        {/each}
      </nav>

      <div class="pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
        <span class="text-xs text-[var(--text-muted)]">Animori Foundation</span>
        <Badge variant="accent" size="sm">Phase 1</Badge>
      </div>
    </div>
  {/if}
</header>
