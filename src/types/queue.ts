import type { Content } from './content'
import type { DownloadStatus } from './downloads'

export interface QueueItem {
  id: string
  title: string
  status: DownloadStatus
  progress: number
  size: number
  downloaded: number
  speed?: number
  priority: number
  createdAt: string
  updatedAt: string
  error?: string
  content: Content
  addedAt?: string // Optional for backward compatibility
}

export interface QueueItemWithStats {
  total: number
  active: number
  paused: number
  completed: number
  failed: number
  totalSize: number
  downloadedSize: number
  averageSpeed: number
}

export interface QueueStats {
  itemCount: number
  totalItems: number
  totalSize: number
  queuedItems: number
  downloadingItems: number
  completedItems: number
  failedItems: number
  averageProgress: number
  estimatedTimeRemaining: number
  quotaUsageAfterQueue: number
}
