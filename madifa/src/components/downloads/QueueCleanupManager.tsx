import React, { useState } from 'react'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useStorageQuota } from '@/hooks/useStorageQuota'
import { IconButton } from '../ui/button'
import { formatBytes } from '@/lib/utils/format'

interface QueueCleanupManagerProps {
  className?: string
  onCleanup?: () => void
}

export default function QueueCleanupManager({
  className = '',
  onCleanup
}: QueueCleanupManagerProps) {
  const { queueItems, removeFromQueue } = useDownloadQueue()
  const { quotaStats } = useStorageQuota()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cleanupMode, setCleanupMode] = useState<
    'incomplete' | 'failed' | 'paused' | 'all'
  >('incomplete')

  const getItemsToClean = () => {
    switch (cleanupMode) {
      case 'incomplete':
        return queueItems.filter(item => item.progress < 100)
      case 'failed':
        return queueItems.filter(item => item.status === 'error')
      case 'paused':
        return queueItems.filter(item => item.status === 'paused')
      case 'all':
        return queueItems
      default:
        return []
    }
  }

  const handleCleanup = async () => {
    if (isProcessing) return

    setIsProcessing(true)
    try {
      const itemsToClean = getItemsToClean()
      await Promise.all(itemsToClean.map(item => removeFromQueue(item.id)))
      onCleanup?.()
    } catch (error) {
      console.error('Failed to clean queue:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getCleanupStats = () => {
    const itemsToClean = getItemsToClean()
    const totalSize = itemsToClean.reduce(
      (sum, item) => sum + (item.content.size || 0),
      0
    )
    return {
      count: itemsToClean.length,
      size: totalSize,
      quotaImpact: (totalSize / quotaStats.quota) * 100
    }
  }

  const stats = getCleanupStats()

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Queue Cleanup</h3>
        <IconButton
          icon="trash"
          onClick={handleCleanup}
          disabled={isProcessing || stats.count === 0}
          className={`${isProcessing ? 'animate-spin' : ''}`}
          aria-label="Clean queue"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Cleanup Mode
          </label>
          <select
            value={cleanupMode}
            onChange={e => setCleanupMode(e.target.value as any)}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          >
            <option value="incomplete">Incomplete Downloads</option>
            <option value="failed">Failed Downloads</option>
            <option value="paused">Paused Downloads</option>
            <option value="all">All Downloads</option>
          </select>
        </div>

        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Items to Clean</span>
            <span className="text-white">{stats.count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Space to Free</span>
            <span className="text-white">{formatBytes(stats.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quota Impact</span>
            <span className={`${
              stats.quotaImpact > 20 ? 'text-green-500' : 'text-white'
            }`}>
              {stats.quotaImpact.toFixed(1)}%
            </span>
          </div>
        </div>

        {stats.count > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Items to Clean
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getItemsToClean().map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-400 truncate flex-1 mr-4">
                    {item.content.title}
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