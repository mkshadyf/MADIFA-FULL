import React, { useEffect } from 'react'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useQuotaEnforcement } from '@/hooks/useQuotaEnforcement'
import { useAuth } from '@/hooks/useAuth'
import type { Content } from '@/types'
import type { SubscriptionService } from '@/lib/services/subscription'
import type { QuotaCheckResult } from '@/types/quota'

interface QueueItem {
  id: string
  content: Content
  priority: number
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed'
}

export interface QuotaAwareDownloadQueueProps {
  onError: (error: Error) => void
  subscriptionService: SubscriptionService
}

export default function QuotaAwareDownloadQueue({
  onError,
  subscriptionService,
}: QuotaAwareDownloadQueueProps) {
  const { user } = useAuth()
  const {
    queueItems,
    removeFromQueue,
    pauseDownload,
    clearQueue,
  } = useDownloadQueue()
  const quotaEnforcement = useQuotaEnforcement(subscriptionService)

  useEffect(() => {
    if (!user?.id) return

    const checkQuotas = async () => {
      for (const item of queueItems) {
        try {
          if (!item.content?.size) {
            console.warn('Missing content size for queue item')
            continue
          }
          const quotaCheck: QuotaCheckResult = await quotaEnforcement.checkQuota(user.id, item.content.size.toString())
          if (quotaCheck.allowed && quotaCheck.remaining > 0) {
            // Proceed with download
          } else if (quotaCheck.error) {
            removeFromQueue(item.id)
            onError(new Error(quotaCheck.error))
          }
        } catch (error) {
          removeFromQueue(item.id)
          onError(error as Error)
        }
      }
    }

    if (queueItems.length > 0) {
      checkQuotas()
    }
  }, [queueItems, quotaEnforcement, removeFromQueue, onError, user])

  if (!user?.id || queueItems.length === 0) return null

  return (
    <div className="space-y-4">
      {queueItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg bg-gray-100 p-4"
        >
          <div>
            <h3 className="font-medium">{item.content.title}</h3>
            <p className="text-sm text-gray-600">{item.content.size} bytes</p>
          </div>
          <button
            onClick={() => pauseDownload(item.id)}
            className="text-red-500 hover:text-red-700"
          >
            Cancel
          </button>
        </div>
      ))}
      {queueItems.length > 0 && (
        <button
          onClick={clearQueue}
          className="w-full rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300"
        >
          Clear Queue
        </button>
      )}
    </div>
  )
}
