import React, { useEffect, useState } from 'react'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { formatBytes, formatDuration } from '@/lib/utils/format'
import type { QueueItemWithStats } from '@/types/queue'

interface QueueStats {
  totalItems: number
  activeItems: number
  completedItems: number
  failedItems: number
  totalSize: number
  downloadedSize: number
  averageSpeed: number
  estimatedCompletion: number
}

export default function QueueStatusTracker() {
  const { queueItems } = useDownloadQueue()
  const [stats, setStats] = useState<QueueStats>({
    totalItems: 0,
    activeItems: 0,
    completedItems: 0,
    failedItems: 0,
    totalSize: 0,
    downloadedSize: 0,
    averageSpeed: 0,
    estimatedCompletion: 0
  })

  useEffect(() => {
    const calculateStats = () => {
      const totalSize = queueItems.reduce((sum, item) => sum + item.content.size, 0)
      const downloadedSize = queueItems.reduce(
        (sum, item) => sum + (item.content.size * item.progress) / 100,
        0
      )
      const activeItems = queueItems.filter(item => item.status === 'downloading')
      const averageSpeed = activeItems.reduce(
        (sum, item) => sum + (item.speed || 0),
        0
      ) / Math.max(activeItems.length, 1)

      setStats({
        totalItems: queueItems.length,
        activeItems: activeItems.length,
        completedItems: queueItems.filter(item => item.status === 'completed').length,
        failedItems: queueItems.filter(item => item.status === 'error').length,
        totalSize,
        downloadedSize,
        averageSpeed,
        estimatedCompletion: averageSpeed ? (totalSize - downloadedSize) / averageSpeed : 0
      })
    }

    calculateStats()
    const interval = setInterval(calculateStats, 1000)
    return () => clearInterval(interval)
  }, [queueItems])

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Queue Progress</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400">Total Progress</p>
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{
                  width: `${(stats.downloadedSize / stats.totalSize) * 100}%`
                }}
              />
            </div>
            <span className="text-sm text-gray-400">
              {Math.round((stats.downloadedSize / stats.totalSize) * 100)}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400">Download Speed</p>
          <p className="text-xl font-semibold text-white">
            {formatBytes(stats.averageSpeed)}/s
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Downloaded</p>
          <p className="text-white">
            {formatBytes(stats.downloadedSize)} / {formatBytes(stats.totalSize)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Time Remaining</p>
          <p className="text-white">
            {formatDuration(stats.estimatedCompletion)}
          </p>
        </div>
      </div>
    </div>
  )
} 