import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types'
import { downloadQueueManager } from './download-queue'
import { storageQuotaManager } from './storage-quota'

const supabase = createClient()

class QuotaAwareQueueManager {
  private static instance: QuotaAwareQueueManager

  static getInstance(): QuotaAwareQueueManager {
    if (!QuotaAwareQueueManager.instance) {
      QuotaAwareQueueManager.instance = new QuotaAwareQueueManager()
    }
    return QuotaAwareQueueManager.instance
  }

  async addToQueue(userId: string, content: Content, priority = 0): Promise<void> {
    // Check quota before adding to queue
    const { canDownload, remainingSpace } = await storageQuotaManager.checkQuota(
      userId,
      content.size || 0
    )

    if (!canDownload) {
      throw new Error(
        `Not enough storage space. Required: ${content.size}, Available: ${remainingSpace}`
      )
    }

    // Get current queue size
    const queueItems = await downloadQueueManager.getQueueItems()
    const queueSize = queueItems.reduce(
      (total, item) => total + (item.content.size || 0),
      0
    )

    // Check if adding this content would exceed quota
    if (queueSize + (content.size || 0) > remainingSpace) {
      throw new Error('Adding this content would exceed your storage quota')
    }

    // Add to queue if checks pass
    await downloadQueueManager.addToQueue(content, priority)
  }

  async optimizeQueue(userId: string): Promise<void> {
    const quota = await storageQuotaManager.getUserQuota(userId)
    const { used } = await storageQuotaManager.getQuotaStats(userId)
    const remainingSpace = quota - used

    const queueItems = await downloadQueueManager.getQueueItems()
    let currentSize = 0
    const itemsToRemove: string[] = []

    // Sort by priority (highest first) and then by size (smallest first)
    const sortedItems = [...queueItems].sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      return (a.content.size || 0) - (b.content.size || 0)
    })

    // Keep items that fit within remaining space
    for (const item of sortedItems) {
      const itemSize = item.content.size || 0
      if (currentSize + itemSize <= remainingSpace) {
        currentSize += itemSize
      } else {
        itemsToRemove.push(item.id)
      }
    }

    // Remove items that don't fit
    for (const itemId of itemsToRemove) {
      await downloadQueueManager.removeFromQueue(itemId)
    }

    return
  }

  async reorderQueueByPriority(userId: string): Promise<void> {
    const queueItems = await downloadQueueManager.getQueueItems()

    // Sort by priority and size efficiency (size/priority ratio)
    const sortedItems = [...queueItems].sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority
      const aEfficiency = (a.content.size || 0) / a.priority
      const bEfficiency = (b.content.size || 0) / b.priority
      return aEfficiency - bEfficiency
    })

    // Update queue order
    await downloadQueueManager.reorderQueue(sortedItems.map(item => item.id))
  }

  async getQueueStats(userId: string): Promise<{
    totalSize: number
    itemCount: number
    estimatedTimeRemaining: number
    quotaUsageAfterQueue: number
  }> {
    const queueItems = await downloadQueueManager.getQueueItems()
    const { used, quota } = await storageQuotaManager.getQuotaStats(userId)

    const totalSize = queueItems.reduce(
      (total, item) => total + (item.content.size || 0),
      0
    )

    return {
      totalSize,
      itemCount: queueItems.length,
      estimatedTimeRemaining: this.calculateEstimatedTime(totalSize),
      quotaUsageAfterQueue: ((used + totalSize) / quota) * 100
    }
  }

  private calculateEstimatedTime(totalSize: number): number {
    // Assume average download speed of 2MB/s
    const averageSpeed = 2 * 1024 * 1024
    return Math.ceil(totalSize / averageSpeed)
  }
}

export const quotaAwareQueue = QuotaAwareQueueManager.getInstance() 