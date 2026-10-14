import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupKitsuMocking } from './helpers/mockKitsu';

test.describe('Animori Phase 5 — Reliability, Error Resilience & Accessibility', () => {
  /* ------------------------------------------------------------------ */
  /* 1. API Reliability & Error States                                  */
  /* ------------------------------------------------------------------ */

  test('HTTP 429 rate limit displays graceful slow-down warning with retry', async ({ page }) => {
    await setupKitsuMocking(page, { rateLimit: true });
    await page.goto('/anime');

    // Page should display user-friendly rate limit message
    await expect(page.getByRole('heading', { name: 'Slow down a little' })).toBeVisible();
    await expect(page.getByText(/receiving too many requests/i)).toBeVisible();

    const retryBtn = page.getByRole('button', { name: 'Try Again' });
    await expect(retryBtn).toBeVisible();

    // Now restore normal mocking and verify retry succeeds
    await setupKitsuMocking(page, { rateLimit: false });
    await retryBtn.click();

    // Catalog should recover and render items
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('HTTP 500 server error displays error state with retry button', async ({ page }) => {
    await setupKitsuMocking(page, { serverError: true });
    await page.goto('/anime');

    await expect(page.getByRole('heading', { name: 'Unable to load anime' })).toBeVisible();
    await expect(page.getByText(/having trouble at the moment/i)).toBeVisible();

    const retryBtn = page.getByRole('button', { name: 'Try Again' });
    await expect(retryBtn).toBeVisible();
  });

  test('Empty search results display clear no-matches message and reset action', async ({ page }) => {
    await setupKitsuMocking(page);
    await page.goto('/anime?q=nonexistent_xyz_query');

    await expect(page.getByRole('heading', { name: /No anime found for/i })).toBeVisible();

    // Reset All Filters button should be present
    const resetBtn = page.getByRole('button', { name: 'Reset All Filters' });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // URL resets and cards render
    await expect(page).toHaveURL('/anime');
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('Failed image URL falls back gracefully without crashing or broken layout', async ({ page }) => {
    await setupKitsuMocking(page);
    // Force poster images to fail with 404
    await page.route(/^https:\/\/media\.kitsu\.(io|app)\/.*$/, (route) => route.abort());

    await page.goto('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    // The hero image will switch to local fallback or fallback container
    const poster = page.locator('img[alt="Poster of Cowboy Bebop"]');
    await expect(poster).toBeVisible();
  });

  /* ------------------------------------------------------------------ */
  /* 2. Keyboard Navigation & Focus Accessibility                      */
  /* ------------------------------------------------------------------ */

  test('Header links, search input, and buttons are keyboard accessible', async ({ page }) => {
    await setupKitsuMocking(page);
    await page.goto('/');

    // Press Tab from initial page load to verify focus moves into interactive elements
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedTag ?? '');

    // Verify search input receives keyboard input
    const searchInput = page.locator('header input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.focus();
      await page.keyboard.type('Cowboy');
      await expect(searchInput).toHaveValue('Cowboy');
    }
  });

  test('Important landmark regions and heading hierarchy exist', async ({ page }) => {
    await setupKitsuMocking(page);
    await page.goto('/');

    // Check semantic landmarks
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check h1 heading exists
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
  });

  /* ------------------------------------------------------------------ */
  /* 3. Automated Accessibility Scans (axe-core)                        */
  /* ------------------------------------------------------------------ */

  test('Homepage passes accessibility scan on representative views', async ({ page }) => {
    await setupKitsuMocking(page);
    await page.goto('/');

    // Wait for content to stabilize
    await expect(page.getByRole('heading', { name: 'Popular Anime' })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // Color tokens audited in theme tests across dual modes
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('Anime detail page passes accessibility scan', async ({ page }) => {
    await setupKitsuMocking(page);
    await page.goto('/anime/1');

    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
