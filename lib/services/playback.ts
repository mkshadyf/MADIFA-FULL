import { createClient } from '@/lib/supabase/client'

interface PlaybackSession {
  id: string
  content_id: string
  user_id: string
  quality: string
  progress: number
  duration: number
  last_position: number
  created_at: string
  updated_at: string
}

export async function initializePlayback(contentId: string, quality: string = '1080p') {
  const supabase = createClient()

  try {
    // Get content details
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (contentError) throw contentError

    // Create or update playback session
    const { data: session, error: sessionError } = await supabase
      .from('playback_sessions')
      .upsert({
        content_id: contentId,
        quality,
        last_position: 0,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Track content view
    await supabase.from('content_views').insert({
      content_id: contentId,
      quality
    })

    return {
      content,
      session,
      streamUrl: `https://stream.madifa.co.za/${contentId}/${quality}/manifest.m3u8`
    }
  } catch (error) {
    console.error('Playback initialization error:', error)
    throw error
  }
}

export async function updatePlaybackProgress(
  sessionId: string,
  progress: number,
  duration: number
) {
  const supabase = createClient()

  try {
    await supabase
      .from('playback_sessions')
      .update({
        progress,
        duration,
        last_position: progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

  } catch (error) {
    console.error('Progress update error:', error)
    throw error
  }
}

export async function completePlayback(sessionId: string) {
  const supabase = createClient()

  try {
    const { data: session } = await supabase
      .from('playback_sessions')
      .select('content_id')
      .eq('id', sessionId)
      .single()

    if (session) {
      // Mark content as completed
      await supabase
        .from('completed_content')
        .insert({
          content_id: session.content_id,
          completed_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Completion tracking error:', error)
    throw error
  }
} 