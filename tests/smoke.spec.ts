import { setupKitsuMocking } from './helpers/mockKitsu';
import { test, expect } from '@playwright/test';

test.describe('Animori Phase 1 — Smoke & Foundation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupKitsuMocking(page);
  });

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

    // Check spotlight showcase poster image is visible and successfully loaded
    const spotlightImg = page.locator("img[alt*=\"showcase\"]");
    await expect(spotlightImg).toBeVisible();
    const isLoaded = await spotlightImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(isLoaded).toBe(true);
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

  test('homepage renders clean production layout without development debug toolbars', async ({ page }) => {
    await page.goto('/');

    // Core content sections are directly visible
    await expect(page.getByRole('heading', { name: 'Popular Anime' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Currently Airing' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming Releases' })).toBeVisible();

    // Verify no development-only state toolbars or demo badges exist
    await expect(page.locator('text=UI Component States')).not.toBeVisible();
    await expect(page.locator('text=Demo View')).not.toBeVisible();
    await expect(page.locator('text=Retry Simulation')).not.toBeVisible();
  });

  test('no horizontal scrollbar on responsive viewport', async ({ page }) => {
    await page.goto('/');
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBe(false);
  });
});
