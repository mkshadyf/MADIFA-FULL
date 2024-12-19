import React, { useEffect, useState } from 'react'

import type { QueueItem } from '@/types/queue'
import { formatBytes, formatDuration } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'

interface QueueStats {
  activeDownloads: number
  pausedDownloads: number
  failedDownloads: number
  averageSpeed: number
  estimatedTimeRemaining: number
}

export default function QueueStatusMonitor () {
  const { queueItems } = useDownloadQueue()
  const [stats, setStats] = useState<QueueStats>({
    activeDownloads: 0,
    pausedDownloads: 0,
    failedDownloads: 0,
    averageSpeed: 0,
    estimatedTimeRemaining: 0,
  })

  useEffect(() => {
    // Calculate queue statistics
    downloading')
    paused')
    error')

    // Calculate average speed from active downloads
    const totalSpeed = activeDownloads.reduce((sum, item) => sum + (item.speed || 0), 0)
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
      estimatedTimeRemaining,
    })
  }, [queueItems])

  return (
    <div className="rounded-lg bg-gray-900 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">Queue Status</h3>

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
          <p className="text-2xl font-semibold text-white">{formatBytes(stats.averageSpeed)}/s</p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-800 pt-4">
        <p className="text-sm text-gray-400">Estimated Time Remaining</p>
        <p className="text-xl font-semibold text-white">
          {formatDuration(stats.estimatedTimeRemaining)}
        </p>
      </div>
    </div>
  )
}
