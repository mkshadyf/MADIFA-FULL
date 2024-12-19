import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User extends SupabaseUser {
  email_verified: boolean
  sendEmailVerification: () => Promise<void>
}

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  display_name: string
  email: string
  role: string
  subscription_tier: string | null
  subscription_status: 'active' | 'cancelled' | 'past_due' | null
  created_at: string
  updated_at: string
}
