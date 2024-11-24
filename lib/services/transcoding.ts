import { createClient } from '@/lib/supabase/client'
import type { TranscodingJob } from '@/lib/types/streaming'

interface TranscodeOptions {
  quality: string
  format: string
  codec: string
  bitrate?: number
  audioCodec?: string
  audioBitrate?: number
}

export async function startTranscoding(
  contentId: string,
  sourceUrl: string,
  options: TranscodeOptions[]
): Promise<TranscodingJob[]> {
  const supabase = createClient()

  try {
    // Create transcoding jobs for each quality
    const jobs = await Promise.all(options.map(async (option) => {
      const { data: job, error } = await supabase
        .from('transcoding_jobs')
        .insert({
          content_id: contentId,
          status: 'pending',
          source_url: sourceUrl,
          options: option,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Start transcoding process
      await fetch('/api/transcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          sourceUrl,
          options: option
        })
      })

      return job
    }))

    return jobs
  } catch (error) {
    console.error('Error starting transcoding:', error)
    throw error
  }
}

export async function updateTranscodeProgress(
  jobId: string,
  progress: number,
  status: 'processing' | 'completed' | 'failed',
  error?: string,
  outputUrl?: string
): Promise<void> {
  const supabase = createClient()

  try {
    const updates: any = {
      progress,
      status,
      error_message: error,
      updated_at: new Date().toISOString()
    }

    if (status === 'completed' && outputUrl) {
      updates.output_url = outputUrl
      updates.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('transcoding_jobs')
      .update(updates)
      .eq('id', jobId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error updating transcoding progress:', error)
    throw error
  }
}

export async function getTranscodingStatus(jobId: string): Promise<TranscodingJob> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('transcoding_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error getting transcoding status:', error)
    throw error
  }
} 