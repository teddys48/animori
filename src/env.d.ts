/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Jikan REST API base URL, e.g. https://api.jikan.moe/v4 */
  readonly PUBLIC_JIKAN_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
