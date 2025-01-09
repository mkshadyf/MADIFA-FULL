import { supabase } from '@/lib/supabase/client'
import type { Content } from '@/types/content'

export interface UploadResult {
  success: boolean
  content?: Content
  error?: string
  file: File
}

export const uploadContent = async (
  file: File,
  metadata: Partial<Content>
): Promise<Content> => {
  let filePath: string | null = null

  try {
    const fileExt = file.name.split('.').pop()
    filePath = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('content').getPublicUrl(filePath)

    const { data, error } = await supabase
      .from('content')
      .insert({
        ...metadata,
        video_url: publicUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Cleanup uploaded file if database insert fails
      await supabase.storage.from('content').remove([filePath])
      throw new Error(`Error creating content record: ${error.message}`)
    }

    return data
  } catch (error) {
    // Cleanup uploaded file on any error
    if (filePath) {
      await supabase.storage.from('content').remove([filePath])
    }
    throw error
  }
}

export const validateContentUpload = (
  file: File,
  metadata: Partial<Content>
): void => {
  const MAX_FILE_SIZE = 1024 * 1024 * 100 // 100MB
  const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/ogg']
  const REQUIRED_METADATA = ['title', 'description', 'category_id']

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 100MB limit')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      'Invalid file type. Only MP4, WebM and OGG video files are allowed'
    )
  }

  // Validate required metadata
  for (const field of REQUIRED_METADATA) {
    if (!metadata[field as keyof typeof metadata]) {
      throw new Error(`Missing required metadata: ${field}`)
    }
  }
}

export const processContentBatch = async (
  files: File[],
  baseMetadata: Partial<Content>,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = []
  let completed = 0

  for (const file of files) {
    try {
      validateContentUpload(file, {
        ...baseMetadata,
        title: file.name.split('.')[0],
      })

      const content = await uploadContent(file, {
        ...baseMetadata,
        title: file.name.split('.')[0],
      })

      results.push({
        success: true,
        content,
        file,
      })
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        file,
      })
    }

    completed++
    onProgress?.(completed, files.length)
  }

  return results
}

export const retryFailedUploads = async (
  failedResults: UploadResult[],
  baseMetadata: Partial<Content>,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadResult[]> => {
  return processContentBatch(
    failedResults.map(r => r.file),
    baseMetadata,
    onProgress
  )
}
