import { createClient } from '@/lib/supabase/client'
import type { VideoQuality } from '@/types/vimeo'
import { getSubscriptionStatus } from './subscription'
import { getVideoDetails } from './vimeo'

export async function getStreamUrl(
  videoId: string,
  quality: VideoQuality = '720p',
  userId?: string
): Promise<string> {
  // Check subscription if user is provided
  if (userId) {
    const subscription = await getSubscriptionStatus(userId)
    if (subscription?.status !== 'active') {
      throw new Error('Active subscription required')
    }
  }

  const video = await getVideoDetails(videoId)
  const file = video.files.find(f => f.quality === quality) || video.files[0]
  return file.link
}

export async function trackProgress(
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
    console.error('Error tracking progress:', error)
    throw error
  }
} 