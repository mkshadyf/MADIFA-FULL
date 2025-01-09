import type { Content } from './content'

export type DownloadStatus =
  | 'queued'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'paused'

export interface DownloadProgress {
  contentId: string
  bytesLoaded: number
  bytesTotal: number
  percent: number
}

export interface QueueItem {
  id: string
  content: Content
  priority: number
  status: DownloadStatus
  progress: number
  addedAt: string
}

export interface StorageInfo {
  used: number
  quota: number
  percentage: number
}

export interface QueueStats {
  totalItems: number
  itemCount: number
  totalSize: number
  queuedItems: number
  downloadingItems: number
  completedItems: number
  failedItems: number
  averageProgress: number
  estimatedTimeRemaining: number
  quotaUsageAfterQueue: number
}
