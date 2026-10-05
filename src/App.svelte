<script lang="ts">
  import { onMount } from 'svelte';
  import AppShell from './lib/layouts/AppShell.svelte';
  import Home from './routes/Home.svelte';
  import Anime from './routes/Anime.svelte';
  import Top from './routes/Top.svelte';
  import Seasonal from './routes/Seasonal.svelte';
  import Upcoming from './routes/Upcoming.svelte';
  import AnimeDetail from './routes/AnimeDetail.svelte';
  import NotFound from './routes/NotFound.svelte';
  import { router } from './lib/router/router.svelte';

  onMount(() => {
    const stop = router.start();
    return stop;
  });

  interface RouteMatch {
    name: string;
    // Svelte 5 component constructor or component type
    component: any;
    props?: Record<string, any>;
  }

  let route = $derived.by<RouteMatch>(() => {
    const p = router.path;

    if (p === '/' || p === '') {
      return { name: 'Home', component: Home };
    }
    if (p === '/anime' || p === '/anime/') {
      return { name: 'Anime', component: Anime };
    }
    const detailMatch = p.match(/^\/anime\/(\d+)\/?$/);
    if (detailMatch) {
      return { name: 'Anime', component: AnimeDetail, props: { id: Number(detailMatch[1]) } };
    }
    if (p === '/top' || p === '/top/') {
      return { name: 'Top', component: Top };
    }
    if (p === '/seasonal' || p === '/seasonal/') {
      return { name: 'Seasonal', component: Seasonal };
    }
    if (p === '/upcoming' || p === '/upcoming/') {
      return { name: 'Upcoming', component: Upcoming };
    }
    return { name: '', component: NotFound };
  });
</script>

<AppShell activeRoute={route.name}>
  <route.component {...(route.props || {})} />
</AppShell>
