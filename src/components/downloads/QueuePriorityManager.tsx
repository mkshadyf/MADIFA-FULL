import React from 'react'
import { useState } from 'react'
import { formatBytes } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import { IconButton } from '../ui/button'

import type { Content } from '@/types/content'

interface QueueItem {
  id: string
  content: Content
  calculatedPriority?: number
}

interface QueuePriorityManagerProps {
  className?: string
  onPriorityChange?: () => void
}

export default function QueuePriorityManager({
  className = '',
  onPriorityChange,
}: QueuePriorityManagerProps) {
  const { queueItems } = useDownloadQueue()
  const { calculatePriority, optimizeQueue } = useQueuePriority()
  const [isProcessing, setIsProcessing] = useState(false)
  const [priorityMode, setPriorityMode] = useState<
    'size' | 'expiration' | 'popularity' | 'custom'
  >('size')

  const handlePriorityChange = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      const itemsWithPriority = await Promise.all(
        queueItems.map(async item => ({
          ...item,
          calculatedPriority: await calculatePriority(item.content),
        }))
      )

      const sortedItems = [...itemsWithPriority]
      switch (priorityMode) {
        case 'size':
          sortedItems.sort(
            (a, b) => (a.content.fileSize || 0) - (b.content.fileSize || 0)
          )
          break
        case 'expiration':
          sortedItems.sort((a, b) => {
            const aExp = new Date(a.content.expiration_date || '').getTime()
            const bExp = new Date(b.content.expiration_date || '').getTime()
            return aExp - bExp
          })
          break
        case 'popularity':
          sortedItems.sort(
            (a, b) => (b.calculatedPriority || 0) - (a.calculatedPriority || 0)
          )
          break
        case 'custom':
          // Keep current order but update priorities
          break
      }

      await optimizeQueue()
      onPriorityChange?.()
    } catch (error) {
      console.error('Failed to update priorities:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Queue Priority</h3>
        <IconButton
          icon="refresh"
          onClick={handlePriorityChange}
          disabled={isProcessing}
          className={`${isProcessing ? 'animate-spin' : ''}`}
          aria-label="Update priorities"
          label="Update priorities"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Priority Mode
          </label>
          <select
            aria-label="Priority Mode"
            value={priorityMode}
            onChange={e =>
              setPriorityMode(e.target.value as typeof priorityMode)
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
          >
            <option value="size">By Size (Smallest First)</option>
            <option value="expiration">By Expiration</option>
            <option value="popularity">By Popularity</option>
            <option value="custom">Custom Order</option>
          </select>
        </div>

        <div className="text-sm text-gray-400">
          <p>Total Items: {queueItems.length}</p>
          <p>
            Total Size:{' '}
            {formatBytes(
              queueItems.reduce(
                (total, item) => total + (item.content.fileSize || 0),
                0
              )
            )}
          </p>
        </div>

        {queueItems.length > 0 && (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <h4 className="mb-2 text-sm font-medium text-gray-300">
              Current Queue Order
            </h4>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {queueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-400">
                    {index + 1}. {item.content.title}
                  </span>
                  <span className="text-gray-500">
                    {formatBytes(item.content.fileSize || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
