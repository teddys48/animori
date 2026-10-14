import { test, expect } from '@playwright/test';

test.describe('Animori Live Kitsu API Smoke Test @live', () => {
  test('Optional live check: Kitsu edge API is reachable and returns Cowboy Bebop', async ({ page }) => {
    // This test intentionally does NOT mock the Kitsu API and hits the real network
    await page.goto('/anime/1');
    await expect(page).toHaveURL('/anime/1');
    await expect(page.getByRole('heading', { name: 'Cowboy Bebop', level: 1 })).toBeVisible({ timeout: 15000 });
  });
});
