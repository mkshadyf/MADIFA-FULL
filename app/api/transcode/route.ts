import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface TranscodeRequest {
  jobId: string
  sourceUrl: string
  options: {
    quality: string
    format: string
    codec: string
    bitrate?: number
    audioCodec?: string
    audioBitrate?: number
  }
}

export async function POST(request: Request) {
  const supabase = createClient()
  let requestData: TranscodeRequest | null = null

  try {
    requestData = await request.json() as TranscodeRequest
    if (!requestData || !requestData.jobId || !requestData.sourceUrl || !requestData.options) {
      throw new Error('Invalid request data')
    }

    // Since we're using Vimeo, we don't need FFmpeg transcoding
    // Just update the job status
    await supabase
      .from('transcode_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_url: requestData.sourceUrl // Use original Vimeo URL
      })
      .eq('id', requestData.jobId)

    return NextResponse.json({ success: true, outputUrl: requestData.sourceUrl })
  } catch (error) {
    console.error('Transcoding error:', error)

    if (requestData?.jobId) {
      await supabase
        .from('transcode_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString()
        })
        .eq('id', requestData.jobId)
    }

    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
} 