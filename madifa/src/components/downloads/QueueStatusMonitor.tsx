import React, { useEffect, useState } from 'react'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { formatBytes, formatDuration } from '@/lib/utils/format'
import type { QueueItem } from '@/types/queue'

interface QueueStats {
  activeDownloads: number
  pausedDownloads: number
  failedDownloads: number
  averageSpeed: number
  estimatedTimeRemaining: number
}

export default function QueueStatusMonitor() {
  const { queueItems } = useDownloadQueue()
  const [stats, setStats] = useState<QueueStats>({
    activeDownloads: 0,
    pausedDownloads: 0,
    failedDownloads: 0,
    averageSpeed: 0,
    estimatedTimeRemaining: 0
  })

  useEffect(() => {
    // Calculate queue statistics
    const activeDownloads = queueItems.filter(
      (item: QueueItem) => item.status === 'downloading'
    )
    const pausedDownloads = queueItems.filter(
      (item: QueueItem) => item.status === 'paused'
    )
    const failedDownloads = queueItems.filter(
      (item: QueueItem) => item.status === 'error'
    )

    // Calculate average speed from active downloads
    const totalSpeed = activeDownloads.reduce(
      (sum, item) => sum + (item.speed || 0), 
      0
    )
    const averageSpeed = activeDownloads.length ? totalSpeed / activeDownloads.length : 0

    // Calculate estimated time remaining
    const remainingBytes = queueItems.reduce((sum, item) => {
      const remaining = (item.content.size || 0) * (1 - item.progress / 100)
      return sum + remaining
    }, 0)
    const estimatedTimeRemaining = averageSpeed ? remainingBytes / averageSpeed : 0

    setStats({
      activeDownloads: activeDownloads.length,
      pausedDownloads: pausedDownloads.length,
      failedDownloads: failedDownloads.length,
      averageSpeed,
      estimatedTimeRemaining
    })
  }, [queueItems])

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Queue Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Active Downloads</p>
          <p className="text-2xl font-semibold text-white">{stats.activeDownloads}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Paused</p>
          <p className="text-2xl font-semibold text-white">{stats.pausedDownloads}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Failed</p>
          <p className="text-2xl font-semibold text-red-500">{stats.failedDownloads}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Average Speed</p>
          <p className="text-2xl font-semibold text-white">
            {formatBytes(stats.averageSpeed)}/s
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-sm text-gray-400">Estimated Time Remaining</p>
        <p className="text-xl font-semibold text-white">
          {formatDuration(stats.estimatedTimeRemaining)}
        </p>
      </div>
    </div>
  )
} 