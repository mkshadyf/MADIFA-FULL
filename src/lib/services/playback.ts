import { createClient } from '@/lib/supabase/server'


export type VideoQuality = 'hd' | 'sd' | 'mobile'

export async function getPlaybackUrl(
  videoId: string,
  quality?: VideoQuality
): Promise<string> {

  // Since VimeoVideo doesn't have files property, we'll need to handle this differently
  // For now returning the direct video URL
  return `https://player.vimeo.com/video/${videoId}`
}

export async function updatePlaybackProgress(
  userId: string,
  videoId: string,
  progress: number
): Promise<void> {
  const supabase = createClient()

  try {
    await supabase.from('watch_history').upsert({
      user_id: userId,
      vimeo_id: videoId,
      progress,
      last_watched: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating playback progress:', error)
    throw error
  }
}
