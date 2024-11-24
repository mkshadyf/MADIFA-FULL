import { createClient } from '@/lib/supabase/server'
import type { UserActivity, UserProfile, UserSettings } from '@/lib/types/user'

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user settings:', error)
    throw error
  }
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(settings)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user settings:', error)
    throw error
  }
}

export async function trackUserActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: activity.userId,
        type: activity.type,
        content_id: activity.contentId,
        metadata: activity.metadata
      })

    if (error) throw error
  } catch (error) {
    console.error('Error tracking user activity:', error)
    throw error
  }
}

export async function getUserActivities(
  userId: string,
  limit = 20
): Promise<UserActivity[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user activities:', error)
    throw error
  }
} 