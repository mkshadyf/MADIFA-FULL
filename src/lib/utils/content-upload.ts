import type { UploadProgress } from '@/types/upload'

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void
}

export async function uploadContent(file: File, options?: UploadOptions): Promise<string> {
  // Upload implementation
  const formData = new FormData()
  formData.append('file', file)

  const xhr = new XMLHttpRequest()

  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (event) => {
      options?.onProgress?.({
        loaded: event.loaded,
        total: event.total,
        percent: (event.loaded / event.total) * 100
      })
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.response).url)
      } else {
        reject(new Error('Upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}
