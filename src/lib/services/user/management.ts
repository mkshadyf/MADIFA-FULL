import { createClient } from '@/lib/supabase/server'
import type { UserProfile } from '@/types/auth'

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
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
): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting user profile:', error)
    throw error
  }
}

export async function getUserPreferences(
  userId: string
): Promise<Record<string, any>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data?.preferences || {}
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    throw error
  }
}

export async function updateUserPreferences(
  userId: string,
  preferences: Record<string, any>
): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      preferences,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }
}
