import { createClient } from '@/lib/supabase/client'
import type { WatchHistoryItem } from '@/types/watch-history'
import { getVideoDetails } from './vimeo'

export async function updateWatchProgress(
  userId: string,
  vimeoId: string,
  progress: number
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from('watch_history').upsert({
      user_id: userId,
      vimeo_id: vimeoId,
      progress,
      last_watched: new Date().toISOString(),
      completed: progress >= 0.95,
    })

    if (error) throw error
  } catch (error) {
    console.error('Error updating watch progress:', error)
    throw error
  }
}

export async function removeFromHistory(
  userId: string,
  vimeoId: string
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('watch_history')
      .delete()
      .eq('user_id', userId)
      .eq('vimeo_id', vimeoId)

    if (error) throw error
  } catch (error) {
    console.error('Error removing from watch history:', error)
    throw error
  }
}

export async function getWatchHistory(
  userId: string,
  limit = 20
): Promise<WatchHistoryItem[]> {
  const supabase = createClient()

  try {
    const { data: history, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(limit)

    if (error) throw error
    if (!history) return []

    // Fetch video details from Vimeo in parallel
    const watchHistory = await Promise.all(
      history.map(async item => {
        try {
          const videoDetails = await getVideoDetails(item.vimeo_id)
          return {
            ...item,
            video: videoDetails,
          }
        } catch (error) {
          console.error(
            `Error fetching video details for ${item.vimeo_id}:`,
            error
          )
          return item
        }
      })
    )

    return watchHistory
  } catch (error) {
    console.error('Error fetching watch history:', error)
    throw error
  }
}

export const watchHistoryService = {
  updateWatchProgress,
  removeFromHistory,
  getWatchHistory,
}
