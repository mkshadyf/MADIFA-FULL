import { createClient } from '@/lib/supabase/server'
import type { VideoQuality } from '@/types/vimeo'
import { getVideoDetails } from './vimeo'

export async function getPlaybackUrl(videoId: string, quality?: VideoQuality): Promise<string> {
  const video = await getVideoDetails(videoId)
  const file = video.files.find(f => f.quality === quality) || video.files[0]
  return file.link
}

export async function updatePlaybackProgress(
  userId: string,
  videoId: string,
  progress: number
): Promise<void> {
  const supabase = createClient()

  try {
    await supabase
      .from('watch_history')
      .upsert({
        user_id: userId,
        vimeo_id: videoId,
        progress,
        last_watched: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error updating playback progress:', error)
    throw error
  }
} 