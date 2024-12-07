import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export const createClient = (customToken?: string): SupabaseClient => {
  return createSupabaseClient(supabaseUrl, customToken || supabaseAnonKey)
}

export default supabase
