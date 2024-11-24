import type { Database as SupabaseDatabase } from '@/lib/supabase/database.types'

declare global {
  type Database = SupabaseDatabase
  type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
  type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
}

export type { Database, Enums, Tables }

