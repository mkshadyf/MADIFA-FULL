/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VIMEO_ACCESS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Document {
  getElementById(elementId: string): HTMLElement | null
}

interface Window {
  document: Document
}

declare const document: Document
declare const window: Window & typeof globalThis 