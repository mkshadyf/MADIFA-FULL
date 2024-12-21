import type { Database as SupabaseDatabase } from '../lib/database.types'

type Tables<T extends keyof SupabaseDatabase['public']['Tables']> =
  SupabaseDatabase['public']['Tables'][T]['Row']
type Enums<T extends keyof SupabaseDatabase['public']['Enums']> =
  SupabaseDatabase['public']['Enums'][T]

declare global {
  type Database = SupabaseDatabase
  type GlobalTables<T extends keyof Database['public']['Tables']> = Tables<T>
  type GlobalEnums<T extends keyof Database['public']['Enums']> = Enums<T>
}

export type { SupabaseDatabase as Database, Enums, Tables }
