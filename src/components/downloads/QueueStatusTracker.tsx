import React, { useEffect, useState } from 'react'

import type { QueueItemWithStats } from '@/types/queue'
import { formatBytes, formatDuration } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'

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
    estimatedCompletion: 0,
  })

  useEffect(() => {
    const calculateStats = () => {
      const totalSize = queueItems.reduce(
        (sum: number, item: QueueItemWithStats) =>
          sum + (item.content?.size || 0),
        0
      )

      const downloadedSize = queueItems.reduce(
        (sum: number, item: QueueItemWithStats) =>
          sum + ((item.content?.size || 0) * (item.progress || 0)) / 100,
        0
      )

      const activeItems = queueItems.filter(
        item => item.status === 'downloading'
      )
      const averageSpeed =
        activeItems.reduce(
          (sum: number, item: QueueItemWithStats) => sum + (item.speed || 0),
          0
        ) / Math.max(activeItems.length, 1)

      setStats({
        totalItems: queueItems.length,
        activeItems: activeItems.length,
        completedItems: queueItems.filter(item => item.status === 'completed')
          .length,
        failedItems: queueItems.filter(item => item.status === 'error').length,

        totalSize,
        downloadedSize,
        averageSpeed,
        estimatedCompletion: averageSpeed
          ? (totalSize - downloadedSize) / averageSpeed
          : 0,
      })
    }

    calculateStats()
    const interval = setInterval(calculateStats, 1000)
    return () => clearInterval(interval)
  }, [queueItems])

  return (
    <div className="rounded-lg bg-gray-900 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">Queue Progress</h3>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Total Progress</p>
          <div className="flex items-center space-x-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{
                  width: `${(stats.downloadedSize / stats.totalSize) * 100}%`,
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
