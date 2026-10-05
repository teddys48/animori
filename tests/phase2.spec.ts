import { test, expect } from '@playwright/test';

test.describe('Animori Phase 2 — Jikan API & Anime Discovery', () => {
  test('Navbar links navigate to all Phase 2 discovery routes', async ({ page }) => {
    await page.goto('/');

    const openMenuIfMobile = async () => {
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]').filter({ visible: true });
      if (await hamburger.isVisible()) {
        await hamburger.click();
      }
    };

    // 1. Navigate to Anime catalog
    await openMenuIfMobile();
    await page.locator('header a[href="/anime"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/anime/);
    await expect(page.getByRole('heading', { name: 'Anime Catalog' })).toBeVisible();

    // 2. Navigate to Top Anime
    await openMenuIfMobile();
    await page.locator('header a[href="/top"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/top/);
    await expect(page.getByRole('heading', { name: 'All Anime' })).toBeVisible();

    // 3. Navigate to Seasonal Anime
    await openMenuIfMobile();
    await page.locator('header a[href="/seasonal"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/seasonal/);
    await expect(page.getByRole('heading', { name: 'Seasonal Anime' })).toBeVisible();

    // 4. Navigate to Upcoming Anime
    await openMenuIfMobile();
    await page.locator('header a[href="/upcoming"]').filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/upcoming/);
    await expect(page.getByRole('heading', { name: 'Upcoming Anime' })).toBeVisible();
  });

  test('Anime search form updates URL and preserves search state', async ({ page }) => {
    await page.goto('/anime');

    const searchInput = page.locator('input[aria-label="Search anime titles"]');
    await expect(searchInput).toBeVisible();

    // Fill search term and submit
    await searchInput.fill('Frieren');
    await page.click('button[type="submit"]:has-text("Search")');

    // URL should reflect query
    await expect(page).toHaveURL(/\/anime\?q=Frieren/);
    await expect(page.getByRole('heading', { name: 'Search: "Frieren"' })).toBeVisible();

    // Reload page to test URL state persistence
    await page.reload();
    await expect(page).toHaveURL(/\/anime\?q=Frieren/);
    await expect(searchInput).toHaveValue('Frieren');
  });

  test('Global navbar search navigates to /anime?q=...', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.locator('button[aria-label="Toggle navigation menu"]').filter({ visible: true });
    if (await hamburger.isVisible()) {
      await hamburger.click();
    }

    const navSearch = page.locator('header input[type="text"]').filter({ visible: true }).first();
    await navSearch.fill('Naruto');
    await navSearch.press('Enter');

    await expect(page).toHaveURL(/\/anime\?q=Naruto/);
    await expect(page.getByRole('heading', { name: 'Search: "Naruto"' })).toBeVisible();
  });

  test('Top Anime page supports category switching via URL', async ({ page }) => {
    await page.goto('/top');

    // Click Top Airing category tab
    await page.click('nav[aria-label="Top Anime Categories"] a:has-text("Top Airing")');
    await expect(page).toHaveURL(/\/top\?category=airing/);
    await expect(page.getByRole('heading', { name: 'Top Airing' })).toBeVisible();

    // Click Top Movies category tab
    await page.click('nav[aria-label="Top Anime Categories"] a:has-text("Top Movies")');
    await expect(page).toHaveURL(/\/top\?category=movie/);
    await expect(page.getByRole('heading', { name: 'Top Movies' })).toBeVisible();
  });

  test('Prepared detail route renders for /anime/:id', async ({ page }) => {
    await page.goto('/anime/52991');

    await expect(page).toHaveURL('/anime/52991');
    await expect(page.getByText('Phase 3 Preview')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Catalog' })).toBeVisible();
  });

  test('404 Not Found route renders for unknown paths', async ({ page }) => {
    await page.goto('/non-existent-route-xyz');

    await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go Home' })).toBeVisible();
  });

  test('No horizontal scrollbar across viewports (375px, 768px, 1024px, 1440px)', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 }
    ];

    const routes = ['/anime', '/top', '/seasonal', '/upcoming'];

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
});
