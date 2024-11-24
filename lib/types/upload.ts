export interface UploadProgress {
  loaded: number
  total: number
}

export interface FileOptions {
  cacheControl?: string
  contentType?: string
  upsert?: boolean
  onUploadProgress?: (progress: UploadProgress) => void
  onProgress?: (progress: UploadProgress) => void
} 