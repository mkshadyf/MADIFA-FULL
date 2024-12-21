import React from "react"
import { useEffect, useState } from 'react'
import { useQueueStore } from '@/stores/queueStore'
import type { QueueItem } from '@/stores/queueStore'
import { AnimatePresence, motion } from 'framer-motion'

import { useToast } from '@/hooks/useToast'

type ErroredItem = Omit<
  Pick<QueueItem, 'id' | 'title' | 'error' | 'retryCount' | 'lastRetry'>,
  'error'
> & {
  error: string
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds

export default function QueueErrorRecovery() {
  const [erroredItems, setErroredItems] = useState<ErroredItem[]>([])
  const [retrying, setRetrying] = useState<string[]>([])
  const { getErroredItems, retryDownload, removeFromQueue } = useQueueStore()
  const toast = useToast()

  useEffect(() => {
    const items = getErroredItems()
    setErroredItems(items as ErroredItem[])

    // Auto-retry logic
    items.forEach(item => {
      if (item.retryCount < MAX_RETRIES && !item.lastRetry) {
        handleRetry(item.id, true)
      }
    })
  }, [getErroredItems])

  const handleRetry = async (itemId: string, isAuto = false) => {
    if (retrying.includes(itemId)) return

    setRetrying(prev => [...prev, itemId])

    try {
      await new Promise(resolve =>
        setTimeout(resolve, isAuto ? RETRY_DELAY : 0)
      )
      await retryDownload(itemId)
      setErroredItems(prev => prev.filter(item => item.id !== itemId))
      toast.showToast("Download restarted successfully", "success")
    } catch (error) {
      toast.showToast('Failed to restart download', "error")
      console.error('Error retrying download:', error)

      // Update retry count and last retry time
      setErroredItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                retryCount: item.retryCount + 1,
                lastRetry: new Date(),
              }
            : item
        )
      )
    } finally {
      setRetrying(prev => prev.filter(id => id !== itemId))
    }
  }

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromQueue(itemId)
      setErroredItems(prev => prev.filter(item => item.id !== itemId))
        toast.showToast('Item removed from queue', "success")
    } catch (error) {
      toast.showToast('Failed to remove item', "error")
    }
  }

  if (erroredItems.length === 0) {
    return null
  }

  return (
    <div className="mb-4 rounded-lg bg-red-900/20 p-4">
      <h3 className="mb-3 text-lg font-semibold text-red-400">
        Failed Downloads ({erroredItems.length})
      </h3>

      <div className="space-y-3">
        {erroredItems.map(item => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded bg-gray-800 p-3"
          >
            <div className="flex-1">
              <p className="font-medium text-white">{item.title}</p>
              <p className="text-sm text-red-400">{item.error}</p>
              <p className="text-xs text-gray-400">
                Retry attempts: {item.retryCount}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleRetry(item.id)}
                disabled={retrying.includes(item.id)}
                className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white
                         hover:bg-indigo-700 disabled:opacity-50"
              >
                {retrying.includes(item.id) ? 'Retrying...' : 'Retry'}
              </button>

              <button
                onClick={() => handleRemove(item.id)}
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white
                         hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {erroredItems.length > 1 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => erroredItems.forEach(item => handleRetry(item.id))}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white
                     hover:bg-indigo-700"
          >
            Retry All
          </button>
        </div>
      )}
    </div>
  )
}
