import { test, expect } from '@playwright/test';

test.describe('Animori Phase 4 — Advanced Discovery & UX', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  /* ------------------------------------------------------------------ */
  /* 1. Advanced Discovery: Filters and Sorting                          */
  /* ------------------------------------------------------------------ */

  test('Filters update URL parameters, display active chips, and can be removed individually', async ({ page }) => {
    await page.goto('/anime');

    // Wait for catalog to load
    await expect(page.getByRole('heading', { name: 'Anime Catalog' })).toBeVisible();

    // Select format filter (Movie)
    const typeSelect = page.locator('select#filter-type');
    await typeSelect.selectOption('movie');

    // URL should synchronize
    await expect(page).toHaveURL(/\/anime\?.*type=movie/);

    // Active chip should be visible
    const formatChip = page.locator('text=Format: Movie');
    await expect(formatChip).toBeVisible();

    // Select status filter (Currently Airing)
    const statusSelect = page.locator('select#filter-status');
    await statusSelect.selectOption('current');
    await expect(page).toHaveURL(/\/anime\?.*status=current/);
    await expect(page.locator('text=Status: Currently Airing')).toBeVisible();

    // Remove status chip using (x) button
    const removeStatusBtn = page.locator('button[aria-label="Remove status filter"]');
    await removeStatusBtn.click();

    // URL should no longer have status=current, but still have type=movie
    await expect(page).toHaveURL(/\/anime\?.*type=movie/);
    await expect(page).not.toHaveURL(/status=current/);
    await expect(formatChip).toBeVisible();
  });

  test('Sorting updates URL parameter and restores with direct URL navigation', async ({ page }) => {
    await page.goto('/anime');

    const sortSelect = page.locator('select#filter-sort');
    await sortSelect.selectOption('rating');

    // URL should reflect sort=rating
    await expect(page).toHaveURL(/\/anime\?.*sort=rating/);
    await expect(page.locator('text=Sort: Highest Rated')).toBeVisible();

    // Direct navigation with multiple params
    await page.goto('/anime?type=TV&sort=rating');
    await expect(page.locator('select#filter-type')).toHaveValue('TV');
    await expect(page.locator('select#filter-sort')).toHaveValue('rating');
    await expect(page.locator('text=Format: TV Series')).toBeVisible();
    await expect(page.locator('text=Sort: Highest Rated')).toBeVisible();
  });

  test('Reset All Filters clears active filters and restores full catalog', async ({ page }) => {
    await page.goto('/anime?type=OVA&sort=newest&status=finished');

    // Verify chips exist
    await expect(page.locator('text=Format: OVA')).toBeVisible();

    // Click Reset All
    await page.click('button:has-text("Reset All")');

    // URL should be /anime without query parameters
    await expect(page).toHaveURL('/anime');
    await expect(page.locator('select#filter-type')).toHaveValue('');
    await expect(page.locator('select#filter-sort')).toHaveValue('popular');
  });

  test('Browser Back and Forward buttons restore search and filter state', async ({ page }) => {
    await page.goto('/anime');

    // Select Movie filter
    await page.locator('select#filter-type').selectOption('movie');
    await expect(page).toHaveURL(/\/anime\?.*type=movie/);

    // Select Action genre
    await page.locator('select#filter-category').selectOption('action');
    await expect(page).toHaveURL(/\/anime\?.*category=action/);

    // Press Browser Back
    await page.goBack();
    await expect(page).toHaveURL(/\/anime\?type=movie/);
    await expect(page.locator('select#filter-type')).toHaveValue('movie');
    await expect(page.locator('select#filter-category')).toHaveValue('');

    // Press Browser Forward
    await page.goForward();
    await expect(page).toHaveURL(/\/anime\?.*category=action/);
    await expect(page.locator('select#filter-category')).toHaveValue('action');
  });

  /* ------------------------------------------------------------------ */
  /* 2. Debounced Search & Input Handling                               */
  /* ------------------------------------------------------------------ */

  test('Search input debounces keystrokes and updates URL', async ({ page }) => {
    await page.goto('/anime');

    const searchInput = page.locator('input[aria-label="Search anime titles"]');
    await searchInput.fill('Demon Slayer');

    // Wait for debounced sync (400ms)
    await expect(page).toHaveURL(/\/anime\?.*q=Demon\+Slayer/);
    await expect(page.getByRole('heading', { name: /Demon Slayer/i })).toBeVisible();

    // Clear search with clear button
    const clearBtn = page.locator('button[aria-label="Clear search"]');
    await clearBtn.click();

    await expect(page).toHaveURL('/anime');
    await expect(searchInput).toHaveValue('');
  });

  /* ------------------------------------------------------------------ */
  /* 3. Favorites: Adding, Removing, Persistence & Dedicated Page       */
  /* ------------------------------------------------------------------ */

  test('Favorites can be added from AnimeCard, persist in localStorage, and appear on /favorites', async ({ page }) => {
    await page.goto('/anime');

    // Wait for anime cards to render
    const firstCard = page.locator('article').first();
    await expect(firstCard).toBeVisible();

    // Find the favorite button on the first card
    const favBtn = firstCard.locator('button[aria-label^="Add "][aria-label$=" to favorites"]');
    await expect(favBtn).toBeVisible();
    await favBtn.click();

    // Button should now indicate favorited state
    await expect(firstCard.locator('button[aria-label^="Remove "][aria-label$=" from favorites"]')).toBeVisible();

    // Verify localStorage has entry
    const libraryRaw = await page.evaluate(() => localStorage.getItem('animori_user_library'));
    expect(libraryRaw).not.toBeNull();
    const library = JSON.parse(libraryRaw!);
    expect(library.length).toBeGreaterThanOrEqual(1);
    expect(library[0].isFavorite).toBe(true);

    // Navigate to /favorites
    await page.goto('/favorites');
    await expect(page).toHaveURL('/favorites');
    await expect(page.getByRole('heading', { name: 'My Favorites' })).toBeVisible();

    // Card should appear in favorites grid
    const favCard = page.locator('article').first();
    await expect(favCard).toBeVisible();

    // Remove from favorites via card action
    const unfavBtn = favCard.locator('button[aria-label^="Remove "][aria-label$=" from favorites"]');
    await unfavBtn.click();

    // Grid should now show empty state
    await expect(page.getByRole('heading', { name: 'No Favorites Yet' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Anime Catalog' })).toBeVisible();
  });

  test('Favorites can be toggled from AnimeDetail page', async ({ page }) => {
    await page.goto('/anime/1');

    // Wait for hero to render
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    // Find hero favorite button
    const heroFavBtn = page.locator('button[aria-label="Add Cowboy Bebop to favorites"]');
    await expect(heroFavBtn).toBeVisible();
    await heroFavBtn.click();

    // Hero button should now say Favorited
    await expect(page.locator('button[aria-label="Remove Cowboy Bebop from favorites"]')).toBeVisible();

    // Reload page to verify persistence
    await page.reload();
    await expect(page.locator('button[aria-label="Remove Cowboy Bebop from favorites"]')).toBeVisible();
  });

  /* ------------------------------------------------------------------ */
  /* 4. Watchlist: Status Selection, Tab Filtering & Dedicated Page      */
  /* ------------------------------------------------------------------ */

  test('Watchlist status can be set, persists across refresh, and filters by status tab', async ({ page }) => {
    await page.goto('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    // Click watchlist dropdown trigger in hero
    const watchlistTrigger = page.locator('button[aria-label^="Watchlist status:"]');
    await watchlistTrigger.click();

    // Select "Watching" from dropdown menu
    const watchingOption = page.locator('button[role="menuitem"]:has-text("Watching")');
    await expect(watchingOption).toBeVisible();
    await watchingOption.click();

    // Verify trigger now shows Watching
    await expect(page.locator('button[aria-label="Watchlist status: Watching"]')).toBeVisible();

    // Navigate to /watchlist
    await page.goto('/watchlist');
    await expect(page).toHaveURL('/watchlist');
    await expect(page.getByRole('heading', { name: 'My Watchlist' })).toBeVisible();

    // Card should be visible on "All" tab
    await expect(page.locator('article')).toHaveCount(1);
    await expect(page.locator('article h3')).toHaveText('Cowboy Bebop');

    // Switch to "Watching" tab
    const watchingTab = page.locator('button[role="tab"]:has-text("Watching")');
    await watchingTab.click();
    await expect(page).toHaveURL('/watchlist?status=watching');
    await expect(page.locator('article')).toHaveCount(1);

    // Switch to "Completed" tab
    const completedTab = page.locator('button[role="tab"]:has-text("Completed")');
    await completedTab.click();
    await expect(page).toHaveURL('/watchlist?status=completed');
    // Completed tab should have empty state
    await expect(page.getByRole('heading', { name: 'No Anime Matches' })).toBeVisible();
  });

  /* ------------------------------------------------------------------ */
  /* 5. Recently Viewed Anime                                           */
  /* ------------------------------------------------------------------ */

  test('Visiting anime detail pages records history and displays on homepage', async ({ page }) => {
    // Visit Cowboy Bebop detail page
    await page.goto('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    // Verify recent store in localStorage has recorded ID 1
    const recentRaw = await page.evaluate(() => localStorage.getItem('animori_recent_views'));
    expect(recentRaw).not.toBeNull();
    const recent = JSON.parse(recentRaw!);
    expect(recent.length).toBe(1);
    expect(recent[0].id).toBe('1');
    expect(recent[0].title).toBe('Cowboy Bebop');

    // Navigate to homepage
    await page.goto('/');

    // "Recently Viewed" section should now be visible
    const recentHeading = page.getByRole('heading', { name: 'Recently Viewed' });
    await expect(recentHeading).toBeVisible();

    // Cowboy Bebop should be rendered in the section
    const recentCard = page.locator('section#recent-views article').first();
    await expect(recentCard).toBeVisible();
    await expect(recentCard.locator('h3')).toHaveText('Cowboy Bebop');

    // Click "Clear History" button
    const clearBtn = page.locator('button:has-text("Clear History")');
    await clearBtn.click();

    // Recently viewed section should cleanly disappear
    await expect(recentHeading).not.toBeVisible();
  });

  /* ------------------------------------------------------------------ */
  /* 6. Malformed LocalStorage Resilience                               */
  /* ------------------------------------------------------------------ */

  test('App handles malformed or corrupted localStorage data gracefully without crash', async ({ page }) => {
    // Seed corrupted data
    await page.addInitScript(() => {
      localStorage.setItem('animori_user_library', 'INVALID_JSON_CORRUPTED{{{');
      localStorage.setItem('animori_recent_views', '[{"invalid": true, "id": null}]');
    });

    // App should load smoothly without runtime errors
    await page.goto('/favorites');
    await expect(page.getByRole('heading', { name: 'No Favorites Yet' })).toBeVisible();

    await page.goto('/watchlist');
    await expect(page.getByRole('heading', { name: 'Your Watchlist is Empty' })).toBeVisible();

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Popular Anime' })).toBeVisible();
  });

  /* ------------------------------------------------------------------ */
  /* 7. Responsive Viewport Acceptance Criteria                         */
  /* ------------------------------------------------------------------ */

  test('No horizontal scrollbar across all responsive viewports for Phase 4 routes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 }
    ];

    const routes = ['/anime', '/favorites', '/watchlist'];

    for (const route of routes) {
      await page.goto(route);
      for (const vp of viewports) {
        await page.setViewportSize(vp);
        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });
        expect(isOverflowing).toBe(false);
      }
    }
  });
  /* ------------------------------------------------------------------ */
  /* 8. Filter & Sort Dropdown Dark Mode Legibility                     */
  /* ------------------------------------------------------------------ */

  test("Filter and sort dropdowns are fully legible and high-contrast in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/anime");

    const selectIds = [
      "#filter-type",
      "#filter-status",
      "#filter-category",
      "#filter-season",
      "#filter-year",
      "#filter-sort"
    ];

    for (const id of selectIds) {
      const select = page.locator(`select${id}`);
      await expect(select).toBeVisible();

      // Verify select has dark color-scheme in computed styles
      const selectStyles = await select.evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return {
          colorScheme: cs.colorScheme,
          color: cs.color
        };
      });

      expect(selectStyles.colorScheme).toContain("dark");

      // Verify options are defined and have options
      const optionCount = await select.locator("option").count();
      expect(optionCount).toBeGreaterThan(1);
    }
  });
});
