import type { Content } from './content'

export interface QueueItem {
  id: string
  content: Content
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error'
  progress: number
  speed?: number
  error?: string
  priority: number
  addedAt: number
}

export interface QueueItemWithStats extends QueueItem {
  estimatedTimeRemaining?: number
  averageSpeed?: number
  retryCount?: number
} 