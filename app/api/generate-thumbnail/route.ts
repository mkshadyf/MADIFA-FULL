import { createServerClient } from '@/lib/supabase/client'
import { createFFmpeg } from '@ffmpeg/ffmpeg'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    const { contentId, sourceUrl, timestamp } = await request.json()

    // Initialize FFmpeg
    const ffmpeg = await createFFmpeg({
      log: true,
      corePath: '/ffmpeg-core/ffmpeg-core.js'
    })

    // Download source file
    const sourceResponse = await fetch(sourceUrl)
    const sourceBuffer = await sourceResponse.arrayBuffer()
    ffmpeg.FS('writeFile', 'input.mp4', new Uint8Array(sourceBuffer))

    // Generate thumbnail at specified timestamp
    await ffmpeg.run(
      '-ss', timestamp.toString(),
      '-i', 'input.mp4',
      '-vframes', '1',
      '-vf', 'scale=640:360',
      '-f', 'image2',
      'thumbnail.jpg'
    )

    // Read thumbnail data
    const thumbnailData = ffmpeg.FS('readFile', 'thumbnail.jpg')

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(`${contentId}/${Date.now()}.jpg`, thumbnailData)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('thumbnails')
      .getPublicUrl(uploadData.path)

    return NextResponse.json({ thumbnailUrl: publicUrl })
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    return NextResponse.json(
      { error: 'Thumbnail generation failed' },
      { status: 500 }
    )
  }
} 