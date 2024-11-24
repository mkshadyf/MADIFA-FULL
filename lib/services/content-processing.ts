import { createClient } from '@/lib/supabase/client'
import { startTranscoding } from './transcoding'

interface ProcessingOptions {
  qualities: ('480p' | '720p' | '1080p')[]
  generateThumbnails: boolean
  thumbnailCount?: number
  format?: 'mp4' | 'hls'
  audioCodec?: 'aac' | 'opus'
}

interface ProcessingResult {
  contentId: string
  status: 'completed' | 'failed'
  error?: string
  outputs: {
    quality: string
    url: string
  }[]
  thumbnails?: string[]
}

export async function processContent(
  contentId: string,
  sourceUrl: string,
  options: ProcessingOptions = {
    qualities: ['480p', '720p', '1080p'],
    generateThumbnails: true,
    thumbnailCount: 3,
    format: 'hls',
    audioCodec: 'aac'
  }
): Promise<ProcessingResult> {
  const supabase = createClient()

  try {
    // Update content status to processing
    await supabase
      .from('content')
      .update({ status: 'processing' })
      .eq('id', contentId)

    // Start transcoding jobs for each quality
    const transcodeJobs = await startTranscoding(contentId, sourceUrl, options.qualities.map(quality => ({
      quality,
      format: options.format || 'hls',
      codec: 'h264',
      audioCodec: options.audioCodec || 'aac',
      bitrate: getBitrateForQuality(quality)
    })))

    // Generate thumbnails if requested
    let thumbnails: string[] = []
    if (options.generateThumbnails) {
      thumbnails = await generateThumbnails(contentId, sourceUrl, options.thumbnailCount || 3)
    }

    // Wait for all transcoding jobs to complete
    const outputs = await Promise.all(transcodeJobs.map(async (job) => {
      const completedJob = await waitForJobCompletion(job.id)
      return {
        quality: completedJob.options.quality,
        url: completedJob.outputUrl || ''
      }
    }))

    // Update content with processed URLs
    await supabase
      .from('content')
      .update({
        status: 'ready',
        video_urls: outputs.reduce((acc, output) => ({
          ...acc,
          [output.quality]: output.url
        }), {}),
        thumbnail_urls: thumbnails
      })
      .eq('id', contentId)

    return {
      contentId,
      status: 'completed',
      outputs,
      thumbnails
    }
  } catch (error) {
    console.error('Processing error:', error)

    // Update content status to failed
    await supabase
      .from('content')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', contentId)

    return {
      contentId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      outputs: []
    }
  }
}

async function generateThumbnails(
  contentId: string,
  sourceUrl: string,
  count: number
): Promise<string[]> {
  const thumbnails: string[] = []
  const supabase = createClient()

  try {
    // Generate thumbnails at different timestamps
    for (let i = 0; i < count; i++) {
      const response = await fetch('/api/generate-thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          sourceUrl,
          timestamp: (i + 1) * (100 / (count + 1)) // Distribute timestamps evenly
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to generate thumbnail ${i + 1}`)
      }

      const { thumbnailUrl } = await response.json()
      thumbnails.push(thumbnailUrl)
    }

    return thumbnails
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    throw error
  }
}

async function waitForJobCompletion(jobId: string, timeout = 3600000): Promise<any> {
  const startTime = Date.now()
  const interval = 5000 // Check every 5 seconds

  while (Date.now() - startTime < timeout) {
    const status = await fetch(`/api/transcode-status/${jobId}`).then(res => res.json())

    if (status.status === 'completed') {
      return status
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Transcoding failed')
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error('Processing timeout')
}

function getBitrateForQuality(quality: string): number {
  switch (quality) {
    case '1080p':
      return 5000 // 5 Mbps
    case '720p':
      return 2500 // 2.5 Mbps
    case '480p':
      return 1000 // 1 Mbps
    default:
      return 1500 // Default bitrate
  }
} 