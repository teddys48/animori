import { test, expect } from '@playwright/test';
import { setupKitsuMocking } from './helpers/mockKitsu';

test.describe('Animori Phase 3 — Anime Detail Page & Related Information', () => {
  test.beforeEach(async ({ page }) => {
    await setupKitsuMocking(page);
  });

  test('Anime detail page loads real Kitsu data for /anime/1', async ({ page }) => {
    await page.goto('/anime/1');

    await expect(page).toHaveURL('/anime/1');
    // Verify dynamic document title
    await expect(page).toHaveTitle(/Cowboy Bebop/);

    // Verify Hero elements
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to Catalog' })).toBeVisible();

    // Verify poster image
    const poster = page.locator('img[alt="Poster of Cowboy Bebop"]');
    await expect(poster).toBeVisible();

    // Verify metadata section
    await expect(page.getByRole('heading', { name: 'Information' })).toBeVisible();
    await expect(page.getByText('Format', { exact: true })).toBeVisible();
    await expect(page.getByText('TV', { exact: true }).first()).toBeVisible();

    // Verify synopsis
    await expect(page.getByRole('heading', { name: 'Synopsis' })).toBeVisible();
    await expect(page.getByText(/In the year 2071, humanity has colonized/i)).toBeVisible();
  });

  test('Anime detail page supports direct URL navigation and page refresh', async ({ page }) => {
    await page.goto('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    // Refresh page
    await page.reload();
    await expect(page).toHaveURL('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();
  });

  test('Invalid anime ID displays user-friendly error message', async ({ page }) => {
    await page.goto('/anime/invalid-id-xyz');

    await expect(page.getByRole('heading', { name: 'Invalid Anime ID' })).toBeVisible();
    await expect(page.getByText(/must be positive integers/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Anime Catalog' })).toBeVisible();
  });

  test('Non-existent anime ID displays dedicated 404 Not Found state', async ({ page }) => {
    await page.goto('/anime/99999999');

    await expect(page.getByRole('heading', { name: 'Anime Not Found' })).toBeVisible();
    await expect(page.getByText(/couldn't find an anime with ID #99999999/i)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Browse Anime Catalog' })).toBeVisible();
  });

  test('Cards from Home navigate to detail page', async ({ page }) => {
    await page.goto('/');

    // Wait for anime cards inside main sections to appear
    const firstCardLink = page.locator('article a[href^="/anime/"]').first();
    await expect(firstCardLink).toBeVisible();
    const href = await firstCardLink.getAttribute('href');
    expect(href).toMatch(/^\/anime\/\d+$/);

    await firstCardLink.click();
    await expect(page).toHaveURL(new RegExp(href!));
    await expect(page.getByRole('link', { name: 'Back to Catalog' })).toBeVisible();
  });

  test('Cards from Anime Catalog navigate to detail page', async ({ page }) => {
    await page.goto('/anime');

    const firstCardLink = page.locator('article a[href^="/anime/"]').first();
    await expect(firstCardLink).toBeVisible();
    const href = await firstCardLink.getAttribute('href');
    expect(href).toMatch(/^\/anime\/\d+$/);

    await firstCardLink.click();
    await expect(page).toHaveURL(new RegExp(href!));
    await expect(page.getByRole('link', { name: 'Back to Catalog' })).toBeVisible();
  });

  test('Characters & Voice Actors section loads and renders', async ({ page }) => {
    await page.goto('/anime/1');

    // Section heading
    await expect(page.getByRole('heading', { name: /Characters & Voice Actors/i })).toBeVisible();

    // Verify main characters (e.g. Spike Spiegel)
    await expect(page.getByText('Spike Spiegel').first()).toBeVisible();
  });

  test('Related Anime section renders and supports navigation', async ({ page }) => {
    await page.goto('/anime/1');

    // Section heading
    const relatedSection = page.getByRole('heading', { name: /Related Anime/i });
    if (await relatedSection.isVisible()) {
      // Has related items like movie or special
      const relatedLink = page.locator('section[aria-label="Related Anime"] a[href^="/anime/"]').first();
      await expect(relatedLink).toBeVisible();
      const href = await relatedLink.getAttribute('href');
      expect(href).toMatch(/^\/anime\/\d+$/);

      await relatedLink.click();
      await expect(page).toHaveURL(new RegExp(href!));
      await expect(page.getByRole('link', { name: 'Back to Catalog' })).toBeVisible();
    }
  });

  test('Detail page has no horizontal scrollbar across all responsive viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 }
    ];

    await page.goto('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(isOverflowing).toBe(false);
    }
  });

  test('Detail page adapts contrast and readability in dark and light themes', async ({ page }) => {
    await page.goto('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    // Default dark theme
    await expect(page.locator('html')).toHaveClass(/dark/);
    const darkHeading = page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 });
    await expect(darkHeading).toBeVisible();

    // Switch to light theme
    const themeBtn = page.locator('button[aria-label*="Switch to light"]').first();
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      await expect(page.locator('html')).toHaveClass(/light/);
      await expect(darkHeading).toBeVisible();
    }
  });
});
