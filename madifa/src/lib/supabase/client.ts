import { env } from '@/config/env'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let client: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createClient() {
  if (!client) {
    client = createSupabaseClient<Database>(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          storage: window.localStorage,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        }
      }
    )
  }
  return client
} 
