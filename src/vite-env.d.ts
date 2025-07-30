/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string;
  // add other env variables here if needed
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
