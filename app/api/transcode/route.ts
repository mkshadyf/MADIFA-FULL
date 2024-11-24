import { updateTranscodeProgress } from '@/lib/services/transcoding'
import { createServerClient } from '@/lib/supabase/client'
import { createFFmpeg } from '@ffmpeg/ffmpeg'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    const { jobId, sourceUrl, options } = await request.json()

    // Update job status to processing
    await updateTranscodeProgress(jobId, 0, 'processing')

    // Initialize FFmpeg worker
    const ffmpeg = await createFFmpeg({
      log: true,
      corePath: '/ffmpeg-core/ffmpeg-core.js'
    })

    // Download source file
    const sourceResponse = await fetch(sourceUrl)
    const sourceBuffer = await sourceResponse.arrayBuffer()
    ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(sourceBuffer))

    // Set FFmpeg parameters based on quality
    const outputParams = getFFmpegParams(options)

    // Start transcoding
    await ffmpeg.run(
      '-i', 'input.mp4',
      ...outputParams,
      'output.mp4'
    )

    // Read output file
    const outputData = ffmpeg.FS('readFile', 'output.mp4')

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('transcoded')
      .upload(`${jobId}/output.mp4`, outputData)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('transcoded')
      .getPublicUrl(`${jobId}/output.mp4`)

    // Update job as completed
    await updateTranscodeProgress(jobId, 100, 'completed', undefined, publicUrl)

    return NextResponse.json({ success: true, outputUrl: publicUrl })
  } catch (error) {
    console.error('Transcoding error:', error)

    // Update job as failed
    if (jobId) {
      await updateTranscodeProgress(
        jobId,
        0,
        'failed',
        error instanceof Error ? error.message : 'Transcoding failed'
      )
    }

    return NextResponse.json(
      { error: 'Transcoding failed' },
      { status: 500 }
    )
  }
}

function getFFmpegParams(options: {
  quality: string
  format: string
  codec: string
  bitrate?: number
  audioCodec?: string
  audioBitrate?: number
}): string[] {
  const params: string[] = []

  // Video codec
  if (options.codec === 'h264') {
    params.push('-c:v', 'libx264')
  } else if (options.codec === 'h265') {
    params.push('-c:v', 'libx265')
  }

  // Video quality/resolution
  if (options.quality === '1080p') {
    params.push('-vf', 'scale=1920:1080')
  } else if (options.quality === '720p') {
    params.push('-vf', 'scale=1280:720')
  } else if (options.quality === '480p') {
    params.push('-vf', 'scale=854:480')
  }

  // Video bitrate
  if (options.bitrate) {
    params.push('-b:v', `${options.bitrate}k`)
  }

  // Audio codec
  if (options.audioCodec === 'aac') {
    params.push('-c:a', 'aac')
  } else if (options.audioCodec === 'opus') {
    params.push('-c:a', 'libopus')
  }

  // Audio bitrate
  if (options.audioBitrate) {
    params.push('-b:a', `${options.audioBitrate}k`)
  }

  // Format-specific settings
  if (options.format === 'hls') {
    params.push(
      '-f', 'hls',
      '-hls_time', '10',
      '-hls_list_size', '0',
      '-hls_segment_filename', 'segment_%03d.ts'
    )
  }

  return params
} 