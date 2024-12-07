import React, { useState } from 'react'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { IconButton } from '../ui/Button'
import { formatBytes } from '@/lib/utils/format'

interface QueuePriorityManagerProps {
  className?: string
  onPriorityChange?: () => void
}

export default function QueuePriorityManager({
  className = '',
  onPriorityChange
}: QueuePriorityManagerProps) {
  const { queueItems, reorderQueue } = useDownloadQueue()
  const { calculatePriority } = useQueuePriority()
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
          calculatedPriority: await calculatePriority(item.content)
        }))
      )

      let sortedItems = [...itemsWithPriority]
      switch (priorityMode) {
        case 'size':
          sortedItems.sort((a, b) => (a.content.size || 0) - (b.content.size || 0))
          break
        case 'expiration':
          sortedItems.sort((a, b) => {
            const aExp = new Date(a.content.expiration_date || '').getTime()
            const bExp = new Date(b.content.expiration_date || '').getTime()
            return aExp - bExp
          })
          break
        case 'popularity':
          sortedItems.sort((a, b) => b.calculatedPriority - a.calculatedPriority)
          break
        case 'custom':
          // Keep current order but update priorities
          break
      }

      await reorderQueue(sortedItems.map(item => item.id))
      onPriorityChange?.()
    } catch (error) {
      console.error('Failed to update priorities:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Queue Priority</h3>
        <IconButton
          icon="refresh"
          onClick={handlePriorityChange}
          disabled={isProcessing}
          className={`${isProcessing ? 'animate-spin' : ''}`}
          aria-label="Update priorities"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Priority Mode
          </label>
          <select
            aria-label="Priority Mode"
            value={priorityMode}
            onChange={e => setPriorityMode(e.target.value as any)}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
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
              queueItems.reduce((total, item) => total + (item.content.size || 0), 0)
            )}
          </p>
        </div>

        {queueItems.length > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Current Queue Order
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {queueItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-400">
                    {index + 1}. {item.content.title}
                  </span>
                  <span className="text-gray-500">
                    {formatBytes(item.content.size || 0)}
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