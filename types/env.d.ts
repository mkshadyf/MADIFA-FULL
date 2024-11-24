declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      NEXT_PUBLIC_APP_URL: string
      VIMEO_ACCESS_TOKEN: string
      VIMEO_CLIENT_ID: string
      VIMEO_CLIENT_SECRET: string
      STRIPE_SECRET_KEY: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      STRIPE_WEBHOOK_SECRET: string
      SMTP_USERNAME: string
      SMTP_PASSWORD: string
      SMTP_SERVER: string
      SMTP_PORT: string
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

export { }
