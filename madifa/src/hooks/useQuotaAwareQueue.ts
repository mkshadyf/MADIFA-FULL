import { quotaAwareQueue } from '@/lib/services/quota-aware-queue'
import type { Content } from '@/types'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

interface QueueStats {
  totalSize: number
  itemCount: number
  estimatedTimeRemaining: number
  quotaUsageAfterQueue: number
}

export function useQuotaAwareQueue() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [queueStats, setQueueStats] = useState<QueueStats>({
    totalSize: 0,
    itemCount: 0,
    estimatedTimeRemaining: 0,
    quotaUsageAfterQueue: 0
  })

  useEffect(() => {
    if (!user) return

    const updateStats = async () => {
      try {
        const stats = await quotaAwareQueue.getQueueStats(user.id)
        setQueueStats(stats)

        if (stats.quotaUsageAfterQueue > 90) {
          showToast(
            'Queue will consume most of your storage. Consider removing some items.',
            'warning'
          )
        }
      } catch (error) {
        console.error('Failed to get queue stats:', error)
      }
    }

    updateStats()
    const interval = setInterval(updateStats, 30000) // Update every 30 seconds

    return () => {
      clearInterval(interval)
    }
  }, [user, showToast])

  const addToQueue = async (content: Content, priority = 0) => {
    if (!user || isProcessing) return

    try {
      setIsProcessing(true)
      await quotaAwareQueue.addToQueue(user.id, content, priority)

      const stats = await quotaAwareQueue.getQueueStats(user.id)
      setQueueStats(stats)
    } catch (error) {
      console.error('Failed to add to queue:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to add to queue',
        'error'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const optimizeQueue = async () => {
    if (!user || isProcessing) return

    try {
      setIsProcessing(true)
      await quotaAwareQueue.optimizeQueue(user.id)

      const stats = await quotaAwareQueue.getQueueStats(user.id)
      setQueueStats(stats)

      showToast('Queue optimized successfully', 'success')
    } catch (error) {
      console.error('Failed to optimize queue:', error)
      showToast('Failed to optimize queue', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const reorderQueue = async () => {
    if (!user || isProcessing) return

    try {
      setIsProcessing(true)
      await quotaAwareQueue.reorderQueueByPriority(user.id)
      showToast('Queue reordered successfully', 'success')
    } catch (error) {
      console.error('Failed to reorder queue:', error)
      showToast('Failed to reorder queue', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    queueStats,
    isProcessing,
    addToQueue,
    optimizeQueue,
    reorderQueue
  }
} 