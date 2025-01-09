import { supabase } from '@/lib/supabase/client'
import { type UserProfile } from '@/types'

export interface ProfileForm {
  full_name: string
  avatar_url?: string
  pin_code?: string
  preferences?: UserPreferences
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

export class UserService {
  async updateProfile(userId: string, data: ProfileForm): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', userId)

    if (error) throw error
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updatePreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ preferences })
      .eq('user_id', userId)

    if (error) throw error
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data.preferences
  }
}

export const userService = new UserService()
