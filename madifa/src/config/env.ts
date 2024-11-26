import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  VITE_VIMEO_CLIENT_ID: z.string().min(1),
  VITE_VIMEO_CLIENT_SECRET: z.string().min(1),
  VITE_VIMEO_ACCESS_TOKEN: z.string().min(1),
  VITE_SMTP_USERNAME: z.string().email(),
  VITE_SMTP_PASSWORD: z.string().min(1),
  VITE_SMTP_SERVER: z.string().min(1),
  VITE_SMTP_PORT: z.coerce.number().min(1),
  VITE_GOOGLE_ADS_CLIENT_ID: z.string().optional(),
  VITE_ADSENSE_ID: z.string().optional(),
  VITE_AD_REFRESH_RATE: z.coerce.number().default(30000),
  VITE_AD_ENABLED: z.coerce.boolean().default(true),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_APP_URL: z.string().url().default('http://localhost:3000'),
  VITE_API_URL: z.string().url().default('http://localhost:3000/api')
})

export const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  VITE_VIMEO_CLIENT_ID: import.meta.env.VITE_VIMEO_CLIENT_ID,
  VITE_VIMEO_CLIENT_SECRET: import.meta.env.VITE_VIMEO_CLIENT_SECRET,
  VITE_VIMEO_ACCESS_TOKEN: import.meta.env.VITE_VIMEO_ACCESS_TOKEN,
  VITE_SMTP_USERNAME: import.meta.env.VITE_SMTP_USERNAME,
  VITE_SMTP_PASSWORD: import.meta.env.VITE_SMTP_PASSWORD,
  VITE_SMTP_SERVER: import.meta.env.VITE_SMTP_SERVER,
  VITE_SMTP_PORT: import.meta.env.VITE_SMTP_PORT,
  VITE_GOOGLE_ADS_CLIENT_ID: import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID,
  VITE_ADSENSE_ID: import.meta.env.VITE_ADSENSE_ID,
  VITE_AD_REFRESH_RATE: import.meta.env.VITE_AD_REFRESH_RATE,
  VITE_AD_ENABLED: import.meta.env.VITE_AD_ENABLED,
  NODE_ENV: process.env.NODE_ENV,
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL
})

export type Env = z.infer<typeof envSchema> 