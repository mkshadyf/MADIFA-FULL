/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VIMEO_ACCESS_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
