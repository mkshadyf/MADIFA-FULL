interface Environment {
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
  VITE_APP_VERSION?: string
  NODE_ENV: 'development' | 'production' | 'test'
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_STRIPE_SECRET_KEY',
  'VITE_VIMEO_ACCESS_TOKEN',
  'VITE_VIMEO_CLIENT_ID',
  'VITE_VIMEO_CLIENT_SECRET',
  'VITE_API_URL',
  'VITE_SENTRY_DSN',
  'VITE_APPLOVIN_SDK_KEY',
  'VITE_APPLOVIN_INTERSTITIAL_ID',
  'VITE_APPLOVIN_REWARDED_ID',
] as const

type RequiredEnvVar = (typeof requiredEnvVars)[number]

function validateEnv(): Environment {
  const missingVars = requiredEnvVars.filter(key => !import.meta.env[key])

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingVars.join('\n')}`
    )
  }

  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    VITE_STRIPE_SECRET_KEY: import.meta.env.VITE_STRIPE_SECRET_KEY,
    VITE_VIMEO_ACCESS_TOKEN: import.meta.env.VITE_VIMEO_ACCESS_TOKEN,
    VITE_VIMEO_CLIENT_ID: import.meta.env.VITE_VIMEO_CLIENT_ID,
    VITE_VIMEO_CLIENT_SECRET: import.meta.env.VITE_VIMEO_CLIENT_SECRET,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_APPLOVIN_SDK_KEY: import.meta.env.VITE_APPLOVIN_SDK_KEY,
    VITE_APPLOVIN_INTERSTITIAL_ID: import.meta.env
      .VITE_APPLOVIN_INTERSTITIAL_ID,
    VITE_APPLOVIN_REWARDED_ID: import.meta.env.VITE_APPLOVIN_REWARDED_ID,
    VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    NODE_ENV: import.meta.env.MODE as Environment['NODE_ENV'],
  }

  return env
}

export const env = validateEnv()
