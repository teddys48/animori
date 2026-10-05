<script lang="ts">
  import Container from '../components/ui/Container.svelte';
  import Badge from '../components/ui/Badge.svelte';
</script>

<footer class="mt-20 border-t border-[var(--glass-border)] bg-[var(--footer-bg)] backdrop-blur-xl relative overflow-hidden transition-colors duration-200">
  <!-- Subtle decorative ambient gradient with Bootstrap green -->
  <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#198754]/10 blur-3xl pointer-events-none"></div>

  <Container class="py-12 sm:py-16">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
      <!-- Col 1: Brand & Description -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#198754] via-[#20c997] to-cyan-400 shadow-sm shadow-[#198754]/30">
            <svg class="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <span class="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Ani<span class="text-[#198754] dark:text-[#20c997]">mori</span>
          </span>
          <Badge variant="outline" size="sm" class="ml-2">Phase 1</Badge>
        </div>

        <p class="text-sm text-[var(--text-muted)] max-w-md leading-relaxed">
          Your modern anime discovery and information companion. Explore top-rated series, track seasonal broadcasts, and uncover timeless anime classics with an elegant glassmorphism experience.
        </p>

        <!-- Placeholder Attribution Area -->
        <div class="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4 max-w-md backdrop-blur-md">
          <div class="flex items-center gap-2 mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <svg class="w-3.5 h-3.5 text-[#198754] dark:text-[#20c997]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Data Attribution (Planned Integration)</span>
          </div>
          <p class="text-xs text-[var(--text-muted)] leading-normal">
            Anime metadata in Phase 2 will be powered by the official open-source Jikan REST API (un-official MyAnimeList data). Animori is an independent discovery project and is not affiliated directly with MyAnimeList.
          </p>
        </div>
      </div>

      <!-- Col 2: Navigation Links -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Navigation</h4>
        <ul class="space-y-2 text-sm text-[var(--text-muted)]">
          <li><a href="/" class="hover:text-[#198754] dark:hover:text-[#20c997] transition-colors">Home Discovery</a></li>
          <li><a href="#popular" class="hover:text-[#198754] dark:hover:text-[#20c997] transition-colors">Popular Anime</a></li>
          <li><a href="#airing" class="hover:text-[#198754] dark:hover:text-[#20c997] transition-colors">Currently Airing</a></li>
          <li><a href="#upcoming" class="hover:text-[#198754] dark:hover:text-[#20c997] transition-colors">Upcoming Releases</a></li>
        </ul>
      </div>

      <!-- Col 3: Technical Foundation -->
      <div class="space-y-3">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">Tech Foundation</h4>
        <ul class="space-y-2 text-sm text-[var(--text-muted)]">
          <li class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#198754]"></span>
            <span>Svelte 5 & Vite</span>
          </li>
          <li class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#198754] dark:bg-[#20c997]"></span>
            <span>TypeScript & Bun</span>
          </li>
          <li class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Dual-Theme Glassmorphism</span>
          </li>
          <li class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Docker Ready</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-12 pt-6 border-t border-[var(--glass-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-dim)]">
      <p>© 2026 Animori. Designed with modern glassmorphism principles.</p>
      <div class="flex items-center gap-4">
        <span>Dark & Light Themes</span>
        <span>•</span>
        <span>Accessible Contrast</span>
        <span>•</span>
        <span>Responsive Shell</span>
      </div>
    </div>
  </Container>
</footer>
