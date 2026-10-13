# Animori — Anime Discovery & Information Platform

A modern, production-grade anime discovery and information web application inspired by MyAnimeList, crafted with **Svelte 5**, **Vite**, **TypeScript**, **Bun**, and **Tailwind CSS** using an elegant **glassmorphism** dark-first aesthetic, powered by the public **Kitsu API**.

> **Note:** This repository is currently at **Phase 3 (Anime Detail Page & Related Information)**. Anime detail routes, comprehensive metadata, synopsis, artwork, genres/tags, characters and voice actors, related media relationships, and category exploration are fully integrated with real-time Kitsu data.

---

## Tech Stack

- **Framework:** Svelte 5 (with Runes & Snippets)
- **Bundler & Tooling:** Vite 8
- **Language:** TypeScript 6
- **Runtime & Package Manager:** Bun 1.x
- **Data Provider:** Kitsu JSON:API (`https://kitsu.io/api/edge`)
- **Styling:** Tailwind CSS v4 + Custom Glassmorphism Design Tokens
- **Testing:** Playwright (E2E, Smoke, & Responsive Viewport Tests)
- **Production Server:** Nginx (Alpine) with SPA fallback routing / Bun static runner

---

## Kitsu API Integration

Animori uses the official public [Kitsu API (edge)](https://kitsu.docs.apiary.io/) using standard JSON:API specifications:

- **Base API URL:** `https://kitsu.io/api/edge`
- **Specification:** JSON:API (`Accept: application/vnd.api+json`)
- **Authentication:** Public GET endpoints (no OAuth or API keys needed for discovery)
- **Data Attribution:** Anime metadata and poster/cover images are provided by the [Kitsu Community Platform](https://kitsu.app). Animori does not own the anime catalog or assets.

### Verified API Endpoints

1. **Title Search:**
   `GET /anime?filter[text]={query}&page[limit]={limit}&page[offset]={offset}`
2. **Catalog & Rankings:**
   `GET /anime?sort={sort}&filter[{key}]={val}&page[limit]={limit}&page[offset]={offset}`
   - All Anime (Top Rated): `sort=-averageRating`
   - Top Airing: `filter[status]=current&sort=-averageRating`
   - Top Upcoming: `filter[status]=upcoming&sort=-userCount`
   - Top TV Series: `filter[subtype]=TV&sort=-averageRating`
   - Top Movies: `filter[subtype]=movie&sort=-averageRating`
   - Most Popular: `sort=-userCount`
3. **Trending Anime:**
   `GET /trending/anime?limit={limit}`
4. **Currently Broadcasting (Seasonal):**
   `GET /anime?filter[status]=current&sort=-userCount&page[limit]={limit}&page[offset]={offset}`
5. **Upcoming Releases:**
   `GET /anime?filter[status]=upcoming&sort=-userCount&page[limit]={limit}&page[offset]={offset}`
6. **Single Anime Resource & Categories/Genres:**
   `GET /anime/{id}?include=genres,categories`
7. **Characters & Voice Actors:**
   `GET /anime/{id}/characters?include=character,voices.person&sort=role&page[limit]={limit}`
8. **Media Relationships (Related Anime):**
   `GET /anime/{id}/media-relationships?include=destination&page[limit]={limit}`
9. **Category-Filtered Exploration:**
   `GET /anime?filter[categories]={category}&sort=-userCount&page[limit]={limit}`

### Known API Characteristics & Limitations

- **Page Limit:** Kitsu API enforces a strict maximum page limit of 20 (`page[limit]=20`). Requests exceeding 20 return HTTP 400 Bad Request. Animori standardizes on `PAGE_SIZE = 20`.
- **Pagination Mechanism:** Kitsu uses offset-based pagination (`page[limit]` and `page[offset]`). Animori maps 1-based page numbers seamlessly via `offset = (page - 1) * limit`.
- **Ratings:** Kitsu stores community ratings as percentage strings (e.g. `"82.27"`). Animori normalizes these to standard 10-point scales (e.g. `8.2`) while preserving raw ratings.
- **Recommendations Limitation:** Kitsu API edge does not provide a dedicated `/recommendations` or similar-anime resource (requests return 404 Route Not Found). Animori gracefully implements an explicitly labeled alternative "More Anime to Explore" based on real Kitsu category filtering (`filter[categories]=...`), transparently attributing the data source without fabricating artificial recommendations.
- **Rate Limiting:** HTTP 429 responses are intercepted, honoring `Retry-After` headers without aggressive retry loops.

---

## API Architecture

Animori employs a clean 4-tier separation of concerns:

```text
Svelte Pages (Home, Anime, Top, Seasonal, Upcoming, AnimeDetail)
     ↓
Anime Service (src/lib/api/anime.ts)
     ↓
Kitsu API Client (src/lib/api/kitsu.ts)
     ↓
Kitsu JSON:API (https://kitsu.io/api/edge)
     ↓
Normalized Model Mapping (AnimeItem, CharacterItem, RelatedAnimeItem in src/lib/types/anime.ts)
     ↓
Reusable UI Components (AnimeCard, AnimeDetailHero, AnimeMetadata, AnimeSynopsis, AnimeCharacters, AnimeRelated, AnimeRecommendations)
```

- **`src/lib/api/kitsu.ts`:** Base URL configuration, JSON:API headers, URL parameter serialization, in-memory caching (5-min TTL), in-flight deduplication, and error normalization.
- **`src/lib/api/anime.ts`:** Domain-specific anime service, pagination calculations, category mappings, and JSON:API translation for anime, characters, and related media.
- **`src/lib/api/types.ts`:** Strongly typed JSON:API contracts for Kitsu resources, relationships, and meta.
- **`src/lib/api/errors.ts`:** `KitsuError` model providing user-friendly error representations without leaking stack traces.
- **`src/lib/api/resource.svelte.ts`:** Svelte 5 reactive wrapper managing `loading`, `success`, and `error` states with request cancellation safety.
- **`src/lib/utils/seo.ts`:** Dynamic client-side SEO and Open Graph metadata manager.

---

## Implemented Routes & Features

- **`/` (Home Discovery):** Hero spotlight, UI state preview toggle, and independent sections for Popular, Currently Airing, and Upcoming releases.
- **`/anime` (Catalog & Title Search):** Full-text search with button and Enter submission, URL state synchronization (`?q=...&page=...`), loading skeletons, empty state, and pagination.
- **`/top` (Top Rankings):** Category tabs for All Anime, Top Airing, Top Upcoming, Top TV, Top Movies, and Most Popular, synchronized via `?category=...&page=...`.
- **`/seasonal` (Currently Airing):** Verified Kitsu current broadcast listing with pagination and responsive card grid.
- **`/upcoming` (Upcoming Releases):** Officially scheduled upcoming anime releases with pagination.
- **`/anime/:id` (Anime Detail Page — Phase 3):**
  - Atmospheric hero with cover artwork, 3:4 poster, rating badges, titles (canonical, English, Japanese), and action links.
  - Comprehensive sidebar metadata (format, status, episodes, episode duration, total runtime, aired dates, ranks, members, favorites, age rating).
  - Clean synopsis with comfortable line length and expand/collapse control for long descriptions.
  - Characters & voice actors section with character photos, names, role badges, voice actor portraits, and language tags.
  - Related anime section with mapped relationship roles (Sequel, Prequel, Side Story, Alternative Version, etc.) navigating to their respective detail pages.
  - "More Anime to Explore" section powered by verified Kitsu category filtering.
  - Dedicated zero-shift loading skeletons matching the exact hero and content layout.
  - Error recovery, 404 Not Found states for missing resources, and invalid ID error handling.
  - Dynamic SEO title, description, and Open Graph tags.

---

## Project Structure

```text
animori/
├── nginx.conf                     # Nginx SPA fallback configuration
├── Dockerfile                     # Multi-stage production Docker build
├── index.html                     # HTML entry point with anti-FOUC script
├── package.json                   # Dependencies and scripts
├── playwright.config.ts           # Playwright test configuration
├── server.ts                      # Bun production static & SPA server
├── tsconfig.json                  # TypeScript workspace configuration
├── tsconfig.app.json              # TypeScript app compiler options
├── vite.config.ts                 # Vite bundler & Tailwind configuration
├── tests/
│   ├── smoke.spec.ts              # Playwright smoke & layout tests
│   ├── theme.spec.ts              # Theme switcher & contrast tests
│   ├── phase2.spec.ts             # Phase 2 discovery & search tests
│   └── phase3.spec.ts             # Phase 3 detail page & related content tests
└── src/
    ├── app.css                    # Tailwind setup & glass utility classes
    ├── App.svelte                 # Root application wrapper & router
    ├── main.ts                    # Svelte mount entrypoint
    ├── routes/
    │   ├── Home.svelte            # Homepage
    │   ├── Anime.svelte           # Search & catalog listing
    │   ├── Top.svelte             # Categorized top rankings
    │   ├── Seasonal.svelte        # Current broadcasts
    │   ├── Upcoming.svelte        # Upcoming releases
    │   ├── AnimeDetail.svelte     # Anime detail page
    │   └── NotFound.svelte        # 404 page
    └── lib/
        ├── api/
        │   ├── kitsu.ts           # Kitsu JSON:API client
        │   ├── anime.ts           # Anime service & data mapping
        │   ├── types.ts           # Kitsu API TypeScript types
        │   ├── errors.ts          # Normalized KitsuError
        │   └── resource.svelte.ts # Reactive resource loader
        ├── components/
        │   ├── anime/
        │   │   ├── AnimeCard.svelte
        │   │   ├── AnimeCardSkeleton.svelte
        │   │   ├── AnimeGrid.svelte
        │   │   ├── AnimeResults.svelte
        │   │   ├── AnimeDetailHero.svelte
        │   │   ├── AnimeMetadata.svelte
        │   │   ├── AnimeSynopsis.svelte
        │   │   ├── AnimeCharacters.svelte
        │   │   ├── AnimeRelated.svelte
        │   │   └── AnimeRecommendations.svelte
        │   └── ui/
        │       ├── Badge.svelte
        │       ├── Button.svelte
        │       ├── Card.svelte
        │       ├── Container.svelte
        │       ├── EmptyState.svelte
        │       ├── ErrorState.svelte
        │       ├── Input.svelte
        │       ├── PageHeader.svelte
        │       ├── Pagination.svelte
        │       ├── SectionHeader.svelte
        │       ├── Skeleton.svelte
        │       └── ThemeToggle.svelte
        ├── config/
        │   └── env.ts             # Centralized environment variables
        ├── layouts/
        │   ├── AppShell.svelte
        │   ├── Footer.svelte
        │   └── Navbar.svelte
        ├── router/
        │   └── router.svelte.ts   # SPA History API router
        ├── styles/
        │   └── tokens.css         # Design tokens (colors, blurs)
        ├── types/
        │   └── anime.ts           # Normalized application models
        └── utils/
            └── seo.ts             # Dynamic document & OG metadata utility
```

---

## Development & Testing Commands

### Install dependencies
```bash
bun install
```

### Start development server
```bash
bun run dev
```

### Type-check & lint
```bash
bun run check
```

### Build production assets
```bash
bun run build
```

### Run Playwright E2E tests
```bash
bun run test
```

---

## Docker & Production Deployment

### Build the Docker Image
```bash
docker build -t animori:latest .
```

### Run the Production Container
```bash
docker run -d --name animori -p 80:80 animori:latest
```

Open [http://localhost](http://localhost) in your browser. All client routes (`/anime`, `/anime/:id`, `/top`, `/seasonal`, `/upcoming`) correctly resolve through Nginx's SPA fallback.
