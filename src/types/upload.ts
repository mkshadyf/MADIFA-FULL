export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface FileOptions {
  cacheControl?: string
  contentType?: string
  upsert?: boolean
}
