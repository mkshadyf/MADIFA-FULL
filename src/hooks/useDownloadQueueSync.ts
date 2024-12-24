import type { Content } from '@/types'
import { EventEmitter } from 'events'
import { useEffect } from 'react'

export interface QueueItem {
  id: string
  content: Content
  priority: number
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress?: number
  error?: string
}

export interface DownloadQueueManager extends EventEmitter {
  addToQueue: (content: Content) => void
  removeFromQueue: (contentId: string) => void
  getQueue: () => QueueItem[]
  clearQueue: () => void
  restoreQueue: () => Promise<void>
  reorderQueue: (newOrder: string[]) => void
  subscribe: (callback: (queue: QueueItem[]) => void) => () => void
}

export function useDownloadQueueSync(queueManager: DownloadQueueManager) {
  useEffect(() => {
    const handleQueueChange = (queue: QueueItem[]) => {
      // Handle queue changes
      console.log('Queue updated:', queue)
    }

    const unsubscribe = queueManager.subscribe(handleQueueChange)

    return () => {
      unsubscribe()
    }
  }, [queueManager])

  useEffect(() => {
    // Restore queue on mount
    queueManager.restoreQueue().catch(console.error)
  }, [queueManager])

  return null
}
