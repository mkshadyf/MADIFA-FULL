import { createClient } from '@/lib/supabase/client'
import type { FileOptions, UploadProgress } from '@/lib/types/upload'

interface UploadOptions extends FileOptions {
  onProgress?: (progress: UploadProgress) => void
}

export async function uploadContent(
  file: File,
  path: string,
  options?: UploadOptions
): Promise<string> {
  const supabase = createClient()
  let loaded = 0

  try {
    const { data, error } = await supabase.storage
      .from('content')
      .upload(`${path}/${crypto.randomUUID()}`, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
        onUploadProgress: (progress) => {
          if (options?.onProgress) {
            loaded += progress.loaded
            options.onProgress({
              loaded,
              total: file.size
            })
          }
        }
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('content')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
} 
