import { useState, useEffect } from 'react'
import { useQueueStore } from '@/stores/queueStore'
import { useToast } from '@/hooks/useToast'
import { motion, AnimatePresence } from 'framer-motion'
import type { QueueItem } from '@/stores/queueStore'

type ErroredItem = Omit<Pick<QueueItem, 'id' | 'title' | 'error' | 'retryCount' | 'lastRetry'>, 'error'> & {
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
      await new Promise(resolve => setTimeout(resolve, isAuto ? RETRY_DELAY : 0))
      await retryDownload(itemId)
      setErroredItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Download restarted successfully')
    } catch (error) {
      toast.error('Failed to restart download')
      console.error('Error retrying download:', error)
      
      // Update retry count and last retry time
      setErroredItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              retryCount: item.retryCount + 1,
              lastRetry: new Date()
            }
          : item
      ))
    } finally {
      setRetrying(prev => prev.filter(id => id !== itemId))
    }
  }

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromQueue(itemId)
      setErroredItems(prev => prev.filter(item => item.id !== itemId))
      toast.success('Item removed from queue')
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  if (erroredItems.length === 0) {
    return null
  }

  return (
    <div className="bg-red-900/20 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-red-400 mb-3">
        Failed Downloads ({erroredItems.length})
      </h3>
      
      <div className="space-y-3">
        {erroredItems.map((item) => (
          <div 
            key={item.id}
            className="flex items-center justify-between bg-gray-800 rounded p-3"
          >
            <div className="flex-1">
              <p className="text-white font-medium">{item.title}</p>
              <p className="text-sm text-red-400">{item.error}</p>
              <p className="text-xs text-gray-400">
                Retry attempts: {item.retryCount}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleRetry(item.id)}
                disabled={retrying.includes(item.id)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md
                         hover:bg-indigo-700 disabled:opacity-50"
              >
                {retrying.includes(item.id) ? 'Retrying...' : 'Retry'}
              </button>

              <button
                onClick={() => handleRemove(item.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md
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
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md
                     hover:bg-indigo-700"
          >
            Retry All
          </button>
        </div>
      )}
    </div>
  )
} 