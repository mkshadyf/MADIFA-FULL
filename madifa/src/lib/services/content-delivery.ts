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
  contentId: string,
  progress: number,
  duration: number
): Promise<void> {
  try {
    await fetch(`/api/progress/${contentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress: progress.toString(),
        duration: duration.toString(),
      }),
    })
  } catch (error) {
    console.error('Progress tracking error:', error)
  }
} 
