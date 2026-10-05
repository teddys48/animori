# Animori — Anime Discovery & Information Platform

A modern, production-grade anime information and discovery web application inspired by MyAnimeList, crafted with **Svelte 5**, **Vite**, **TypeScript**, **Bun**, and **Tailwind CSS** using an elegant **glassmorphism** dark-first aesthetic.

> **Note:** This repository is currently at **Phase 1 (Foundation & UI Shell)**. External API integrations (Jikan API), search functionality, authentication, and database logic are intentionally scoped for future phases.

---

## Tech Stack

- **Framework:** Svelte 5 (with Runes & Snippets)
- **Bundler & Tooling:** Vite 8
- **Language:** TypeScript 6
- **Runtime & Package Manager:** Bun 1.x
- **Styling:** Tailwind CSS v4 + Custom Glassmorphism Design System Tokens
- **Testing:** Playwright (E2E Smoke & Foundation Tests)
- **Containerization:** Multi-stage Docker (Bun Builder + Minimal Bun Runner)

---

## Design System & Aesthetic

Animori implements a modern **dark-first glassmorphism** design:
- **Background:** Very dark navy/black (`#050811`, `#090e1a`) with a subtle ambient radial gradient.
- **Glass Surfaces:** Translucent surfaces with `rgba(255, 255, 255, 0.05 - 0.10)` opacity.
- **Backdrop Blur:** Intentional 12–24px blur levels for sleek depth.
- **Borders:** Crisp, subtle translucent borders (`rgba(255, 255, 255, 0.10 - 0.15)`).
- **Shadows:** Soft, subtle elevation without harsh glow.
- **Border Radius:** Clean rounded corners (`16–24px` / `rounded-2xl` - `rounded-3xl`).
- **Typography:** `Inter` / `Geist` / `Manrope` for clear visual hierarchy.
- **Accent:** Bootstrap Green (`#198754`, `#20c997`) for primary interactive controls, active badges, and focus rings.
- **Posters:** Kept 100% solid and normal for crisp focus and immersion.
- **Glass Effects Applied To:** Navbar, filter controls, cards, modal, and detail panels.

---

## Project Structure

```text
animori/
├── .dockerignore                  # Docker exclusion rules
├── .env.example                   # Environment configuration template
├── .gitignore                     # Git ignore rules
├── Dockerfile                     # Multi-stage production Docker build
├── index.html                     # HTML entry point with metadata
├── package.json                   # Dependencies and scripts
├── playwright.config.ts           # Playwright test configuration
├── server.ts                      # Bun production static & SPA server
├── tsconfig.json                  # TypeScript workspace configuration
├── tsconfig.app.json              # TypeScript app compiler options
├── vite.config.ts                 # Vite bundler & Tailwind configuration
├── tests/
│   └── smoke.spec.ts              # Playwright smoke & layout tests
└── src/
    ├── app.css                    # Tailwind setup & glass utility classes
    ├── App.svelte                 # Root application wrapper
    ├── main.ts                    # Svelte mount entrypoint
    ├── routes/
    │   └── Home.svelte            # Homepage (Hero, Popular, Airing, Upcoming, States)
    └── lib/
        ├── components/
        │   ├── anime/
        │   │   ├── AnimeCard.svelte          # Reusable anime card with hover glow
        │   │   └── AnimeCardSkeleton.svelte  # Matching pulse loading skeleton
        │   └── ui/
        │       ├── Badge.svelte              # Color-coded pill & standard badges
        │       ├── Button.svelte             # Accessible buttons (primary, glass, etc.)
        │       ├── Card.svelte               # Reusable glass container
        │       ├── Container.svelte          # Responsive max-width wrapper
        │       ├── EmptyState.svelte         # Zero-data feedback placeholder
        │       ├── ErrorState.svelte         # Error alert with retry button
        │       ├── Input.svelte              # Glass text input with icon slots
        │       ├── SectionHeader.svelte      # Section title with badge & action link
        │       └── Skeleton.svelte           # Base animated placeholder block
        ├── config/
        │   └── env.ts                        # Centralized environment variables
        ├── data/
        │   └── mockAnime.ts                  # Static mock anime data for Phase 1
        ├── layouts/
        │   ├── AppShell.svelte               # Global application shell
        │   ├── Footer.svelte                 # Footer with attribution disclaimer
        │   └── Navbar.svelte                 # Sticky glass navbar with mobile menu
        ├── styles/
        │   └── tokens.css                    # Centralized design tokens (colors, blurs)
        └── types/
            └── anime.ts                      # TypeScript interfaces (Jikan-compatible)
```

---

## Development

Install dependencies using **Bun**:

```bash
bun install
```

Start the local development server:

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Preview

Type-check and verify Svelte components:

```bash
bun run check
```

Build the optimized production assets:

```bash
bun run build
```

Preview the production build locally:

```bash
bun run preview
```

Or run the Bun production server:

```bash
bun run start
```

---

## Testing (Playwright)

Install browser binaries for Playwright:

```bash
bunx playwright install chromium
```

Run end-to-end smoke tests:

```bash
bun run test
```

---

## Docker

### Build the Docker Image

The application uses an efficient multi-stage build (`oven/bun:1-alpine`):

```bash
docker build -t animori:latest .
```

### Run the Docker Container

```bash
docker run -d --name animori -p 3000:3000 animori:latest
```

Then visit [http://localhost:3000](http://localhost:3000).

---

## Development Phases

This project is built systematically across structured milestones:

- **Phase 1 — Foundation & UI Shell** *(Current)*
  - Svelte 5 + Vite + TypeScript + Bun setup
  - Dual-theme Glassmorphism design system & centralized CSS variables
  - Dark mode as default with sleek Light mode alternative
  - Theme toggle with instant synchronous anti-FOUC initialization
  - `prefers-color-scheme` support with local storage persistence
  - Reusable UI component library (`Button`, `Card`, `Badge`, `Input`, `Skeleton`, `EmptyState`, `ErrorState`, `ThemeToggle`)
  - App shell with responsive Navbar and Footer (with Jikan attribution disclaimer)
  - Homepage with Hero spotlight and mock sections (Popular, Airing, Upcoming)
  - Playwright test setup and multi-stage Docker deployment

### Phase 1 Theme System Acceptance Criteria

- [x] **Dark mode works:** Default very dark navy/black aesthetic (`#050811`) with subtle glowing ambient gradient and translucent surfaces.
- [x] **Light mode works:** Cool light gray/slate aesthetic (`#f4f6fa`) with frosted translucent glass and high-contrast typography.
- [x] **Theme toggle works:** Accessible toggle in navbar (desktop and mobile) switching dynamically between modes.
- [x] **Theme preference persists after reload:** Stored in `localStorage` under `animori_theme` key.
- [x] **System preference is respected when no preference exists:** Responds to OS-level `prefers-color-scheme`.
- [x] **All major components support both themes:** Navbar, Hero, Cards, Badges, Inputs, Buttons, Skeletons, and Footer adapt automatically via centralized design tokens.
- [x] **No unreadable text or low-contrast UI:** WCAG AA contrast ratios maintained in both themes.
- [x] **No flash of incorrect theme on initial load:** Synchronous head script resolves and applies the theme before DOM rendering.

- **Phase 2 — Jikan API & Anime Discovery**
  - Jikan REST API v4 integration with caching and rate limiting
  - Live search with debouncing
  - Dynamic listing grids with pagination
  - Error and loading state integration

- **Phase 3 — Anime Detail**
  - Dynamic routing for anime details (`/anime/:id`)
  - Full metadata: synopsis, characters, voice actors, trailer modal, score stats
  - Related recommendations and episode list

- **Phase 4 — Advanced Discovery & UX**
  - Advanced filtering (genres, seasons, status, score range, studio)
  - Seasonal calendar view
  - Keyboard shortcuts (`⌘K` command palette)

- **Phase 5 — Playwright & Production Hardening**
  - Full E2E test suite (search flows, navigation, responsive edge cases)
  - Accessibility audit (WCAG AA compliance)
  - Lighthouse performance optimizations and PWA support

- **Phase 6 — Polish & Deployment**
  - CI/CD workflow automation
  - Production monitoring and analytics
  - Final visual refinements
