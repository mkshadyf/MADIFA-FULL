import { createClient } from '@/lib/supabase/client'
import type { WatchHistoryItem } from '@/lib/types/watch-history'
import { getVideoDetails } from './vimeo'

export async function updateWatchProgress(
  userId: string,
  vimeoId: string,
  progress: number
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: userId,
        vimeo_id: vimeoId,
        progress,
        last_watched: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error updating watch progress:', error)
    throw error
  }
}

export async function getWatchHistory(userId: string, limit = 20): Promise<WatchHistoryItem[]> {
  const supabase = createClient()

  try {
    const { data: history, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Fetch video details from Vimeo
    const watchHistory = await Promise.all(
      history.map(async (item: WatchHistoryItem) => {
        const videoDetails = await getVideoDetails(item.vimeo_id)
        return {
          ...item,
          video: videoDetails
        }
      })
    )

    return watchHistory
  } catch (error) {
    console.error('Error fetching watch history:', error)
    throw error
  }
} 