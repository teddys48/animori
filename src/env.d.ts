/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Kitsu JSON:API base URL, e.g. https://kitsu.io/api/edge */
  readonly PUBLIC_KITSU_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
