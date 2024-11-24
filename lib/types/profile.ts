export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  pin_code?: string
  role: 'admin' | 'moderator' | 'user'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  subscription_status: 'active' | 'inactive' | 'past_due'
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  email_notifications: boolean
  autoplay: boolean
  default_quality: '480p' | '720p' | '1080p'
  subtitle_language?: string
  audio_language?: string
  content_restrictions?: {
    max_rating?: string
    restricted_categories?: string[]
  }
}

export interface ProfileUpdate {
  full_name?: string
  avatar_url?: string
  pin_code?: string
  preferences?: Partial<UserPreferences>
} 