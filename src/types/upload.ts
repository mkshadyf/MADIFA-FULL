export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export interface FileOptions {
  maxSize?: number
  allowedTypes?: string[]
  onProgress?: (progress: UploadProgress) => void
  onError?: (error: Error) => void
  onSuccess?: (url: string) => void
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: Error
}

export interface UploadTask {
  id: string
  file: File
  status: UploadStatus
  progress: UploadProgress
  result?: UploadResult
  created_at: string
  updated_at: string
}

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'

export interface UploadQueue {
  tasks: UploadTask[]
  status: QueueStatus
  current_task?: string
  created_at: string
  updated_at: string
}

export type QueueStatus =
  | 'idle'
  | 'processing'
  | 'paused'
  | 'completed'
  | 'failed'
