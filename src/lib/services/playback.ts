import { createClient } from '@/lib/supabase/server'

export type VideoQuality = 'hd' | 'sd' | 'mobile'

export async function getPlaybackUrl(videoId: string): Promise<string> {
  // Since VimeoVideo doesn't have files property, we'll need to handle this differently
  // For now returning the direct video URL
  return `https://player.vimeo.com/video/${videoId}`
}

export async function updatePlaybackProgress(
  userId: string,
  videoId: string,
  progress: number
): Promise<void> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('watch_history').upsert({
      user_id: userId,
      vimeo_id: videoId,
      progress,
      last_watched: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error('Error updating playback progress:', error)
    throw error
  }
}

export async function getPlaybackHistory(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('playback_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching playback history:', error)
    throw error
  }
}
