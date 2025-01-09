import { createClient } from '@/lib/supabase'
import type { Content } from '@/types/content'
import type { VideoQuality } from '@/types/vimeo'

const supabase = createClient()

interface DatabaseContent {
  id: string
  user_id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: number
  category_id: string
  created_at: string
  updated_at: string
  views: number
  rating: number | null
  size: number
  category: string
  tags: string[]
  fileSize: number
  type: 'video' | 'audio' | 'document' | 'image'
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private' | 'unlisted'
  encoding_status?: 'pending' | 'processing' | 'completed' | 'failed'
  expiration_date?: string
  vimeo_id?: string
  metadata?: Record<string, unknown>
}

interface WatchHistoryItem {
  content_id: string
  content: DatabaseContent
}

export async function getStreamUrl(
  contentId: string,
  quality: VideoQuality = 'auto'
): Promise<string> {
  const { data, error } = await supabase
    .from('content_streams')
    .select('stream_url')
    .eq('content_id', contentId)
    .eq('quality', quality)
    .single()

  if (error) {
    throw new Error('Failed to get stream URL')
  }

  return data.stream_url
}

export async function trackProgress(
  contentId: string,
  userId: string,
  progress: number,
  timestamp: number
): Promise<void> {
  const { error } = await supabase.from('watch_history').upsert({
    content_id: contentId,
    user_id: userId,
    progress,
    timestamp,
    last_watched: new Date().toISOString(),
  })

  if (error) {
    throw new Error('Failed to track progress')
  }
}

export async function getWatchHistory(userId: string): Promise<Content[]> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('content_id, content(*)')
    .eq('user_id', userId)
    .order('last_watched', { ascending: false })

  if (error) {
    throw new Error('Failed to get watch history')
  }

  return (
    (data as unknown as WatchHistoryItem[])?.map(
      item =>
        ({
          ...item.content,
          owner_id: item.content.user_id,
          content_type: item.content.type,
        }) as Content
    ) || []
  )
}

export async function getResumePosition(
  contentId: string,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('watch_history')
    .select('progress')
    .eq('content_id', contentId)
    .eq('user_id', userId)
    .single()

  if (error) {
    return 0
  }

  return data.progress
}

export async function clearWatchHistory(userId: string): Promise<void> {
  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to clear watch history')
  }
}

export async function removeFromWatchHistory(
  contentId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('content_id', contentId)
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to remove from watch history')
  }
}

export async function getPlaybackToken(
  contentId: string,
  userId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('generate_playback_token', {
    content_id: contentId,
    user_id: userId,
  })

  if (error) {
    throw new Error('Failed to generate playback token')
  }

  return data
}

export async function validatePlaybackToken(token: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('validate_playback_token', {
    token,
  })

  if (error) {
    return false
  }

  return data
}
