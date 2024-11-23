import { createClient } from '@/lib/supabase/client'
import type { FileOptions } from '@supabase/storage-js'

interface UploadProgress {
  loaded: number
  total: number
}

interface UploadOptions extends FileOptions {
  onProgress?: (progress: UploadProgress) => void
}

export async function uploadContent(
  file: File,
  path: string,
  options?: UploadOptions
): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${path}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  // Create a readable stream from the file
  const fileStream = file.stream()
  const reader = fileStream.getReader()
  let loaded = 0

  // Upload the file in chunks
  const { error: uploadError } = await supabase.storage
    .from('content')
    .upload(filePath, file, {
      ...options,
      duplex: 'half',
      onUploadProgress: (progress: UploadProgress) => {
        loaded += progress.loaded
        options?.onProgress?.({
          loaded,
          total: file.size
        })
      }
    })

  if (uploadError) {
    throw uploadError
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('content')
    .getPublicUrl(filePath)

  return publicUrl
} 