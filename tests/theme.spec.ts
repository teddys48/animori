import { test, expect } from '@playwright/test';

test.describe('Animori Theme System Acceptance Criteria', () => {
  test('Dark mode is the default and system preference is respected when no stored preference exists', async ({ page }) => {
    // Test dark system preference
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(root).toHaveClass(/dark/);
  });

  test('Light mode system preference is respected when no stored preference exists', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const root = page.locator('html');
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(root).toHaveClass(/light/);
  });

  test('Theme toggle works to switch between dark and light modes', async ({ page }) => {
    await page.goto('/');
    const root = page.locator('html');

    // Initial state is dark
    await expect(root).toHaveAttribute('data-theme', 'dark');

    // Click theme toggle button in navbar (pick visible one for current viewport)
    const toggleBtn = page.locator('header button[aria-label*="Switch to light"]').filter({ visible: true });
    await toggleBtn.click();

    // Now theme should be light
    await expect(root).toHaveAttribute('data-theme', 'light');
    await expect(root).toHaveClass(/light/);

    // Click again to switch back to dark
    const toggleBackBtn = page.locator('header button[aria-label*="Switch to dark"]').filter({ visible: true });
    await toggleBackBtn.click();

    await expect(root).toHaveAttribute('data-theme', 'dark');
    await expect(root).toHaveClass(/dark/);
  });

  test('Theme preference persists after page reload', async ({ page }) => {
    await page.goto('/');

    // Toggle to light mode
    const toggleBtn = page.locator('header button[aria-label*="Switch to light"]').filter({ visible: true });
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Reload page
    await page.reload();

    // Verify it remains light mode after reload
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('html')).toHaveClass(/light/);

    // Verify localStorage item
    const storedTheme = await page.evaluate(() => localStorage.getItem('animori_theme'));
    expect(storedTheme).toBe('light');
  });

  test('No flash of incorrect theme on initial load when preference is stored', async ({ page }) => {
    // Set preference before page load
    await page.addInitScript(() => {
      localStorage.setItem('animori_theme', 'light');
    });

    await page.goto('/');

    // The root should have light immediately without flash
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });

  test('All major components render and text has contrast in both dark and light modes', async ({ page }) => {
    await page.goto('/');

    // 1. Dark Mode check
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // 2. Switch to Light Mode
    const toggleBtn = page.locator('header button[aria-label*="Switch to light"]').filter({ visible: true });
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // 3. Light Mode check
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('article').first()).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();

    // Check that hero title text color is not transparent or white-on-white
    const heroColor = await page.locator('#hero-title').evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(heroColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(heroColor).not.toBe('rgb(255, 255, 255)');

    // Check that section headers change color in light mode and are not white
    const sectionHeaderColor = await page.locator('h2').first().evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(sectionHeaderColor).not.toBe('rgb(255, 255, 255)');
    expect(sectionHeaderColor).toBe('rgb(15, 23, 42)');
  });

  test('Specific badges (Spotlight, Score, Top Rated, Season 2025, Anticipated) adapt text colors in light and dark modes', async ({ page }) => {
    await page.goto('/');

    const spotlightBadge = page.getByText('Spotlight of the Season');
    const scoreBadge = page.getByText(/Score/);
    const topRatedBadge = page.getByText('Top Rated', { exact: true });
    const seasonBadge = page.getByText('Season 2025', { exact: true });
    const anticipatedBadge = page.getByText('Anticipated', { exact: true });

    // 1. Dark Mode Verification
    const darkSpotlightColor = await spotlightBadge.evaluate(el => window.getComputedStyle(el).color);
    const darkScoreColor = await scoreBadge.evaluate(el => window.getComputedStyle(el).color);
    const darkTopRatedColor = await topRatedBadge.evaluate(el => window.getComputedStyle(el).color);
    const darkSeasonColor = await seasonBadge.evaluate(el => window.getComputedStyle(el).color);
    const darkAnticipatedColor = await anticipatedBadge.evaluate(el => window.getComputedStyle(el).color);

    expect(darkSpotlightColor).toBe('rgb(32, 201, 151)');
    expect(darkScoreColor).toBe('rgb(255, 193, 7)');
    expect(darkTopRatedColor).toBe('rgb(32, 201, 151)');
    expect(darkSeasonColor).toBe('rgb(32, 201, 151)');
    expect(darkAnticipatedColor).toBe('rgb(13, 202, 240)');

    // 2. Switch to Light Mode
    const toggleBtn = page.locator('header button[aria-label*="Switch to light"]').filter({ visible: true });
    await toggleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // 3. Light Mode Verification (using expect.poll to allow smooth 200ms CSS transition to complete)
    await expect.poll(async () => {
      return await spotlightBadge.evaluate(el => window.getComputedStyle(el).color);
    }).toBe('rgb(15, 81, 50)');     // #0f5132 (WCAG AAA)

    await expect.poll(async () => {
      return await scoreBadge.evaluate(el => window.getComputedStyle(el).color);
    }).toBe('rgb(102, 77, 3)');        // #664d03 (WCAG AAA)

    await expect.poll(async () => {
      return await topRatedBadge.evaluate(el => window.getComputedStyle(el).color);
    }).toBe('rgb(15, 81, 50)');     // #0f5132 (WCAG AAA)

    await expect.poll(async () => {
      return await seasonBadge.evaluate(el => window.getComputedStyle(el).color);
    }).toBe('rgb(15, 81, 50)');       // #0f5132 (WCAG AAA)

    await expect.poll(async () => {
      return await anticipatedBadge.evaluate(el => window.getComputedStyle(el).color);
    }).toBe('rgb(5, 81, 96)');    // #055160 (WCAG AAA)
  });
});
