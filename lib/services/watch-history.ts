import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'

interface WatchHistoryItem {
  id: string
  user_id: string
  content_id: string
  progress: number
  duration: number
  last_watched: string
  content: Content
}

export async function getWatchHistory(userId: string, limit = 20): Promise<WatchHistoryItem[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('viewing_history')
      .select(`
        *,
        content (*)
      `)
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching watch history:', error)
    throw error
  }
}

export async function updateWatchProgress(
  userId: string,
  contentId: string,
  progress: number,
  duration: number
) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('viewing_history')
      .upsert({
        user_id: userId,
        content_id: contentId,
        progress,
        duration,
        last_watched: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error updating watch progress:', error)
    throw error
  }
}

export async function removeFromHistory(userId: string, contentId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('viewing_history')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId)

    if (error) throw error
  } catch (error) {
    console.error('Error removing from history:', error)
    throw error
  }
} 