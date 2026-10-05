<script lang="ts">
  import Container from '../lib/components/ui/Container.svelte';
  import Button from '../lib/components/ui/Button.svelte';

  $effect(() => {
    document.title = '404 Page Not Found — Animori';
  });
</script>

<div class="py-20 sm:py-28">
  <Container class="max-w-md text-center space-y-6">
    <div class="w-16 h-16 rounded-2xl bg-[#198754]/15 border border-[#198754]/30 flex items-center justify-center text-[#198754] dark:text-[#20c997] mx-auto text-2xl font-bold shadow-inner">
      404
    </div>

    <div class="space-y-2">
      <h1 class="text-2xl font-extrabold text-[var(--text-primary)]">Page Not Found</h1>
      <p class="text-sm text-[var(--text-muted)] leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
    </div>

    <div class="pt-2 flex justify-center gap-3">
      <Button href="/" variant="primary" size="md">Go Home</Button>
      <Button href="/anime" variant="glass" size="md">Browse Anime</Button>
    </div>
  </Container>
</div>
