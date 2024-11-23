export type Profile = {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  pin_code?: string
  created_at: string
  updated_at: string
}

export type UserProfile = {
  id: string
  email: string
  profiles: Profile[]
  current_profile_id?: string
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  subscription_status: 'active' | 'inactive' | 'past_due'
} 