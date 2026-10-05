/**
 * Environment configuration for Animori.
 * Centralizes environment variables with sensible defaults.
 *
 * Vite inlines `import.meta.env.*` at build time. The `PUBLIC_` prefix is
 * whitelisted in `vite.config.ts` (`envPrefix`), so only public, non-secret
 * values should ever use it.
 */
const DEFAULT_JIKAN_API_URL = 'https://api.jikan.moe/v4';

export const ENV = {
  JIKAN_API_URL: import.meta.env.PUBLIC_JIKAN_API_URL || DEFAULT_JIKAN_API_URL,
  APP_NAME: 'Animori',
  APP_DESCRIPTION: 'Modern Anime Information & Discovery Platform',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;
