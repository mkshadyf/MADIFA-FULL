import { createClient } from '@/lib/supabase/client'
import type { FileOptions, UploadProgress } from '@/types/upload'

interface UploadOptions extends FileOptions {
  onProgress?: (progress: UploadProgress) => void
  cacheControl?: string
  contentType?: string
  upsert?: boolean
}

export async function uploadContent(
  file: File,
  path: string,
  options?: UploadOptions
): Promise<string> {
  const supabase = createClient()
  const loaded = 0

  try {
    const { data, error } = await supabase.storage
      .from('content')
      .upload(`${path}/${crypto.randomUUID()}`, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false
      })

    if (error) throw error

    if (options?.onProgress) {
      options.onProgress({
        loaded: file.size,
        total: file.size,
        percent: 100
      })
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('content').getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
