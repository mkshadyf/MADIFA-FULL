import { useEffect, useState } from 'react'

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

export default function QueueStatusMonitor() {
  const { queueItems } = useDownloadQueue()
  const [stats, setStats] = useState<QueueStats>({
    activeDownloads: 0,
    pausedDownloads: 0,
    failedDownloads: 0,
    averageSpeed: 0,
    estimatedTimeRemaining: 0,
  })

  useEffect(() => {
    // Filter queue items by status
    const activeDownloads = queueItems.filter(
      item => item.status === 'downloading'
    )
    const pausedDownloads = queueItems.filter(item => item.status === 'paused')
    const failedDownloads = queueItems.filter(item => item.status === 'error')
    // Calculate average speed from active downloads
    const totalSpeed = activeDownloads.reduce<number>(
      (sum, item) => sum + (item.content?.fileSize || 0),
      0
    )
    const averageSpeed = activeDownloads.length
      ? totalSpeed / activeDownloads.length
      : 0

    // Calculate estimated time remaining
    const remainingBytes = queueItems.reduce<number>((sum, item) => {
      const remaining =
        (item.content?.size || 0) * (1 - (item.progress || 0) / 100)
      return sum + remaining
    }, 0)
    const estimatedTimeRemaining = averageSpeed
      ? remainingBytes / averageSpeed
      : 0

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
          <p className="text-2xl font-semibold text-white">
            {stats.activeDownloads}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Paused</p>
          <p className="text-2xl font-semibold text-white">
            {stats.pausedDownloads}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Failed</p>
          <p className="text-2xl font-semibold text-red-500">
            {stats.failedDownloads}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Average Speed</p>
          <p className="text-2xl font-semibold text-white">
            {formatBytes(stats.averageSpeed)}/s
          </p>
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
