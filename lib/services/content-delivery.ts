import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/types/content'

interface StreamResponse {
  streamUrl: string
  content: Content | null
  error?: string
}

interface StreamOptions {
  quality?: '480p' | '720p' | '1080p'
  format?: 'mp4' | 'hls'
}

export async function getStreamUrl(
  contentId: string,
  options: StreamOptions = { quality: '1080p', format: 'hls' }
): Promise<StreamResponse> {
  const supabase = createClient()

  try {
    // Get content details
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (contentError) throw contentError

    // Get signed URL for streaming
    const { data: { signedUrl }, error: urlError } = await supabase.storage
      .from('videos')
      .createSignedUrl(`${contentId}/${options.quality}/${content.video_url}`, 3600)

    if (urlError) throw urlError

    return {
      streamUrl: signedUrl,
      content
    }
  } catch (error) {
    console.error('Error getting stream URL:', error)
    return {
      streamUrl: '',
      content: null,
      error: error instanceof Error ? error.message : 'Failed to get stream URL'
    }
  }
}

export async function trackProgress(
  contentId: string,
  progress: number,
  duration: number
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('viewing_progress')
      .upsert({
        content_id: contentId,
        progress,
        duration,
        last_watched: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error tracking progress:', error)
    throw error
  }
}

export async function getPlaybackToken(
  contentId: string,
  userId: string
): Promise<string> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .rpc('generate_playback_token', {
        content_id: contentId,
        user_id: userId
      })

    if (error) throw error

    return data.token
  } catch (error) {
    console.error('Error generating playback token:', error)
    throw error
  }
}

export async function validatePlaybackToken(token: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .rpc('validate_playback_token', {
        token
      })

    if (error) throw error

    return data.valid
  } catch (error) {
    console.error('Error validating playback token:', error)
    return false
  }
}

export async function getResumePosition(
  contentId: string,
  userId: string
): Promise<number> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('viewing_progress')
      .select('progress')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return data?.progress || 0
  } catch (error) {
    console.error('Error getting resume position:', error)
    return 0
  }
} 