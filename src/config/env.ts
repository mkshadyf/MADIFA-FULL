interface Env {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
  VITE_STRIPE_PUBLIC_KEY: string
  VITE_STRIPE_SECRET_KEY: string
  VITE_VIMEO_ACCESS_TOKEN: string
  VITE_VIMEO_CLIENT_ID: string
  VITE_VIMEO_CLIENT_SECRET: string
  VITE_API_URL: string
  VITE_SENTRY_DSN: string
  NODE_ENV: 'development' | 'production' | 'test'
}

export const env = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY as string,
  VITE_STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY as string,
  VITE_VIMEO_ACCESS_TOKEN: import.meta.env.VITE_VIMEO_ACCESS_TOKEN as string,
  VITE_VIMEO_CLIENT_ID: import.meta.env.VITE_VIMEO_CLIENT_ID as string,
  VITE_VIMEO_CLIENT_SECRET: import.meta.env.VITE_VIMEO_CLIENT_SECRET as string,
  VITE_API_URL: import.meta.env.VITE_API_URL as string,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN as string,
  NODE_ENV: import.meta.env.MODE as 'development' | 'production' | 'test',
} satisfies Env
