declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL: string
    VITE_SUPABASE_ANON_KEY: string
    VITE_STRIPE_PUBLIC_KEY: string
    VITE_STRIPE_SECRET_KEY: string
    VITE_VIMEO_ACCESS_TOKEN: string
    VITE_VIMEO_CLIENT_ID: string
    VITE_VIMEO_CLIENT_SECRET: string
    VITE_API_URL: string
    VITE_SENTRY_DSN: string
    VITE_APPLOVIN_SDK_KEY: string
    VITE_APPLOVIN_INTERSTITIAL_ID: string
    VITE_APPLOVIN_REWARDED_ID: string
    NODE_ENV: 'development' | 'production' | 'test'
  }
}

export { }

