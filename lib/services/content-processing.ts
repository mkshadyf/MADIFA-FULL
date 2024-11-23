import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'

export async function processVideo(content: Content) {
  const supabase = createClient()

  try {
    // Update content status to processing
    await supabase
      .from('content')
      .update({ status: 'processing' })
      .eq('id', content.id)

    // Call video processing API
    const response = await fetch('/api/process-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: content.id,
        videoUrl: content.video_url
      })
    })

    if (!response.ok) throw new Error('Processing failed')

    // Update content with processed video URLs
    const { hlsUrl, thumbnailUrl } = await response.json()

    await supabase
      .from('content')
      .update({
        status: 'ready',
        hls_url: hlsUrl,
        thumbnail_url: thumbnailUrl
      })
      .eq('id', content.id)

  } catch (error) {
    console.error('Processing error:', error)

    // Update content status to failed
    await supabase
      .from('content')
      .update({ status: 'failed' })
      .eq('id', content.id)

    throw error
  }
} 