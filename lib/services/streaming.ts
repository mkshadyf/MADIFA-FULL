import { createClient } from '@/lib/supabase/client'
import type { StreamConfig, StreamManifest, TranscodingJob } from '@/lib/types/streaming'

export async function initializeStream(contentId: string, config: StreamConfig): Promise<StreamManifest> {
  const supabase = createClient()

  try {
    // Get content details
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (contentError) throw contentError

    // Generate signed URLs for each quality
    const qualities = await Promise.all(
      content.available_qualities.map(async (quality: string) => {
        const { data: { signedUrl }, error } = await supabase.storage
          .from('videos')
          .createSignedUrl(`${contentId}/${quality}/${content.video_url}`, 3600)

        if (error) throw error
        return { quality, url: signedUrl }
      })
    )

    // Generate manifest
    const manifest: StreamManifest = {
      id: contentId,
      playbackUrl: qualities.find(q => q.quality === config.quality)?.url || qualities[0].url,
      qualities: qualities.map(q => q.quality),
      duration: content.duration,
      thumbnails: content.thumbnail_urls || [],
      drm: config.drm
    }

    return manifest
  } catch (error) {
    console.error('Stream initialization error:', error)
    throw error
  }
}

export async function startTranscodingJob(
  contentId: string,
  sourceUrl: string,
  qualities: string[]
): Promise<TranscodingJob> {
  const supabase = createClient()

  try {
    // Create transcoding job record
    const { data: job, error: jobError } = await supabase
      .from('transcoding_jobs')
      .insert({
        content_id: contentId,
        status: 'pending',
        qualities,
        source_url: sourceUrl
      })
      .select()
      .single()

    if (jobError) throw jobError

    // Start transcoding process
    const response = await fetch('/api/transcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        contentId,
        sourceUrl,
        qualities
      })
    })

    if (!response.ok) {
      throw new Error('Failed to start transcoding')
    }

    return job
  } catch (error) {
    console.error('Transcoding job error:', error)
    throw error
  }
}

export async function getTranscodingStatus(jobId: string): Promise<TranscodingJob> {
  const supabase = createClient()

  try {
    const { data: job, error } = await supabase
      .from('transcoding_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) throw error
    return job
  } catch (error) {
    console.error('Error getting transcoding status:', error)
    throw error
  }
}

export async function updateTranscodingProgress(
  jobId: string,
  progress: number,
  status: 'processing' | 'completed' | 'failed',
  error?: string
): Promise<void> {
  const supabase = createClient()

  try {
    const { error: updateError } = await supabase
      .from('transcoding_jobs')
      .update({
        progress,
        status,
        error_message: error,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error updating transcoding progress:', error)
    throw error
  }
} 