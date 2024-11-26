import type { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function executeSql(sql: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) throw error
} 
