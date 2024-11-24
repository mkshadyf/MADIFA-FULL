import { createClient } from '@/lib/supabase/client'
import type { ParentalControls, UserPreferences, WatchHistoryItem } from '@/lib/types/user'

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating preferences:', error)
    throw error
  }
}

export async function getWatchHistory(userId: string): Promise<WatchHistoryItem[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('viewing_history')
      .select(`
        *,
        content:content_id (
          id,
          title,
          thumbnail_url,
          duration
        )
      `)
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching watch history:', error)
    throw error
  }
}

export async function toggleFavorite(
  userId: string,
  contentId: string,
  isFavorite: boolean
): Promise<void> {
  const supabase = createClient()

  try {
    if (isFavorite) {
      await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          content_id: contentId,
          created_at: new Date().toISOString()
        })
    } else {
      await supabase
        .from('user_favorites')
        .delete()
        .match({ user_id: userId, content_id: contentId })
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    throw error
  }
}

export async function updateParentalControls(
  userId: string,
  controls: ParentalControls
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        parental_controls: controls,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating parental controls:', error)
    throw error
  }
}

export async function validateParentalPin(
  userId: string,
  pin: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('parental_controls')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return data?.parental_controls?.pin === pin
  } catch (error) {
    console.error('Error validating PIN:', error)
    return false
  }
} 