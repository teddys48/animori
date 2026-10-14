import type { Page, Route } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

function loadFixture(filename: string): any {
  const fullPath = path.join(FIXTURES_DIR, filename);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

export interface MockKitsuOptions {
  /** If true, all intercepted requests return HTTP 429 rate limit */
  rateLimit?: boolean;
  /** If true, all intercepted requests return HTTP 500 server error */
  serverError?: boolean;
  /** If true, list requests return empty data */
  empty?: boolean;
  /** Delay in milliseconds before responding */
  delayMs?: number;
  /** Custom handler override per endpoint */
  customHandler?: (route: Route, url: URL) => Promise<boolean>;
}

// 1x1 transparent PNG buffer for instant image mocking
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

/**
 * Intercepts Kitsu API and CDN requests to provide deterministic, offline-capable responses.
 */
export async function setupKitsuMocking(page: Page, options: MockKitsuOptions = {}): Promise<void> {
  const animeList = loadFixture('anime-list.json');
  const animeDetail1 = loadFixture('anime-detail-1.json');
  const animeDetail46474 = loadFixture('anime-detail-46474.json');
  const animeCharacters1 = loadFixture('anime-characters-1.json');
  const animeRelationships1 = loadFixture('anime-relationships-1.json');
  const searchFrieren = loadFixture('anime-search-frieren.json');
  const searchNaruto = loadFixture('anime-search-naruto.json');
  const emptyList = loadFixture('anime-empty.json');
  const error404 = loadFixture('error-404.json');
  const error429 = loadFixture('error-429.json');

  // Fast-fulfill external Kitsu CDN images
  await page.route(/^https:\/\/media\.kitsu\.(io|app)\/.*$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: PIXEL_PNG
    });
  });

  // Intercept Kitsu Edge API
  await page.route(/^https:\/\/kitsu\.io\/api\/edge\/.*$/, async (route) => {
    const url = new URL(route.request().url());

    if (options.delayMs) {
      await new Promise((r) => setTimeout(r, options.delayMs));
    }

    if (options.customHandler) {
      const handled = await options.customHandler(route, url);
      if (handled) return;
    }

    if (options.rateLimit) {
      await route.fulfill({
        status: 429,
        contentType: 'application/vnd.api+json',
        headers: { 'Retry-After': '2' },
        body: JSON.stringify(error429)
      });
      return;
    }

    if (options.serverError) {
      await route.fulfill({
        status: 500,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify({
          errors: [{ title: 'Internal Server Error', detail: 'Kitsu server error', status: '500' }]
        })
      });
      return;
    }

    const pathname = url.pathname;
    const query = url.searchParams;

    // 1. Non-existent anime ID -> 404
    if (pathname.includes('/anime/99999999')) {
      await route.fulfill({
        status: 404,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify(error404)
      });
      return;
    }

    // 2. Characters endpoint
    if (pathname.includes('/anime/1/characters')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify(animeCharacters1)
      });
      return;
    }

    // 3. Media relationships endpoint
    if (pathname.includes('/anime/1/media-relationships')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify(animeRelationships1)
      });
      return;
    }

    // 4. Detail endpoint for ID 1
    if (pathname === '/api/edge/anime/1') {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify(animeDetail1)
      });
      return;
    }

    // 5. Detail endpoint for ID 46474
    if (pathname === '/api/edge/anime/46474') {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify(animeDetail46474)
      });
      return;
    }

    // 6. Generic Detail endpoint for other IDs in list
    const detailMatch = pathname.match(/\/api\/edge\/anime\/(\d+)$/);
    if (detailMatch) {
      const matchId = detailMatch[1];
      const found = animeList.data.find((item: any) => item.id === matchId);
      if (found) {
        await route.fulfill({
          status: 200,
          contentType: 'application/vnd.api+json',
          body: JSON.stringify({ data: found })
        });
        return;
      }
    }

    // 7. Empty list forced
    if (options.empty) {
      await route.fulfill({
        status: 200,
        contentType: 'application/vnd.api+json',
        body: JSON.stringify(emptyList)
      });
      return;
    }

    // 8. Search queries
    const textFilter = query.get('filter[text]');
    if (textFilter) {
      const lower = textFilter.toLowerCase();
      if (lower.includes('frieren')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/vnd.api+json',
          body: JSON.stringify(searchFrieren)
        });
        return;
      }
      if (lower.includes('naruto')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/vnd.api+json',
          body: JSON.stringify(searchNaruto)
        });
        return;
      }
      if (lower.includes('nonexistent') || lower.includes('emptysearch')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/vnd.api+json',
          body: JSON.stringify(emptyList)
        });
        return;
      }
    }

    // 9. Filter / Category / Pagination / Trending / Default List
    let responseData = [...animeList.data];

    // Filter by subtype if requested
    const subtype = query.get('filter[subtype]');
    if (subtype) {
      responseData = responseData.filter(
        (a: any) => a.attributes.subtype?.toLowerCase() === subtype.toLowerCase()
      );
    }

    // Filter by status if requested
    const status = query.get('filter[status]');
    if (status) {
      responseData = responseData.filter(
        (a: any) => a.attributes.status?.toLowerCase() === status.toLowerCase()
      );
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/vnd.api+json',
      body: JSON.stringify({
        data: responseData,
        meta: { count: responseData.length },
        links: animeList.links
      })
    });
  });
}
