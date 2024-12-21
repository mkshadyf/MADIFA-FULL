import React from 'react'

import { formatBytes, formatDuration } from '@/lib/utils/format'
import { useQueueAnalytics } from '@/hooks/useQueueAnalytics'
import { useQuotaAwareQueue } from '@/hooks/useQuotaAwareQueue'

import { IconButton } from '../ui/button'

interface QueueSummaryProps {
  className?: string
  onClearQueue?: () => void
}

export default function QueueSummary({
  className = '',
  onClearQueue,
}: QueueSummaryProps) {
  const { queueStats } = useQuotaAwareQueue()
  const { efficiency } = useQueueAnalytics()

  const getHealthStatus = () => {
    if (!efficiency) return { label: 'Unknown', color: 'text-gray-400' }
    const score =
      (efficiency.spaceEfficiency +
        efficiency.timeEfficiency +
        efficiency.priorityAlignment) /
      3

    if (score >= 0.8) return { label: 'Healthy', color: 'text-green-500' }
    if (score >= 0.6) return { label: 'Fair', color: 'text-yellow-500' }
    return { label: 'Needs Attention', color: 'text-red-500' }
  }

  const healthStatus = getHealthStatus()

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Queue Summary</h3>
        {onClearQueue ? (
          <IconButton
            label='Clear'
            icon="trash"
            onClick={onClearQueue}
            className="text-gray-400 hover:text-red-500"
            aria-label="Clear queue"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Items in Queue</p>
          <p className="text-2xl font-semibold text-white">
            {queueStats.itemCount}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Total Size</p>
          <p className="text-2xl font-semibold text-white">
            {formatBytes(queueStats.totalSize)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Estimated Time</p>
          <p className="text-2xl font-semibold text-white">
            {formatDuration(queueStats.estimatedTimeRemaining)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Queue Health</p>
          <p className={`text-2xl font-semibold ${healthStatus.color}`}>
            {healthStatus.label}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Storage Usage After Queue</span>
          <span className="text-gray-300">
            {queueStats.quotaUsageAfterQueue.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              queueStats.quotaUsageAfterQueue > 90
                ? 'bg-red-500'
                : queueStats.quotaUsageAfterQueue > 70
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{
              width: `${Math.min(queueStats.quotaUsageAfterQueue, 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
