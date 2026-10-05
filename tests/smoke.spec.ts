import { test, expect } from '@playwright/test';

test.describe('Animori Phase 1 — Smoke & Foundation Tests', () => {
  test('homepage loads successfully with title and logo', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Animori/i);

    // Check navbar brand logo
    const brand = page.locator('header a', { hasText: 'Animori' });
    await expect(brand).toBeVisible();

    // Check hero section exists
    const heroTitle = page.locator('#hero-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText("Frieren: Beyond Journey's End");
  });

  test('renders sections and mock anime cards', async ({ page }) => {
    await page.goto('/');

    // Popular Anime section
    await expect(page.getByRole('heading', { name: 'Popular Anime' })).toBeVisible();

    // Currently Airing section
    await expect(page.getByRole('heading', { name: 'Currently Airing' })).toBeVisible();

    // Upcoming Releases section
    await expect(page.getByRole('heading', { name: 'Upcoming Releases' })).toBeVisible();

    // Verify anime cards exist
    const cards = page.locator('article');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('UI state switcher toggles loading skeleton and error states', async ({ page }) => {
    await page.goto('/');

    // Switch to Loading Skeleton
    await page.click('button:has-text("Loading Skeleton")');
    await expect(page.locator('text=Loading Skeleton State')).toBeVisible();

    // Switch to Empty State
    await page.click('button:has-text("Empty State")');
    await expect(page.locator('text=No Seasonal Anime Matches')).toBeVisible();

    // Switch to Error State
    await page.click('button:has-text("Error State")');
    await expect(page.locator('text=Unable to Connect to Anime Source')).toBeVisible();

    // Return to Normal View
    await page.click('button:has-text("Normal View")');
    await expect(page.getByRole('heading', { name: 'Popular Anime' })).toBeVisible();
  });

  test('no horizontal scrollbar on responsive viewport', async ({ page }) => {
    await page.goto('/');
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });
});
