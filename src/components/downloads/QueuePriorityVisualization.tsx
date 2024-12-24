import React from 'react'

import { formatBytes } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import type { QueueItem } from '@/types/queue'

type PriorityLevel = 'high' | 'medium' | 'low'

interface QueueItemWithPriority extends QueueItem {
  calculatedPriority: number
}

interface QueuePriorityVisualizationProps {
  className?: string
}

export default function QueuePriorityVisualization({
  className = '',
}: QueuePriorityVisualizationProps) {
  const { queueItems } = useDownloadQueue()
  const { calculatePriority } = useQueuePriority()
  const [priorityGroups, setPriorityGroups] = React.useState<{
    high: QueueItemWithPriority[]
    medium: QueueItemWithPriority[]
    low: QueueItemWithPriority[]
  }>({
    high: [],
    medium: [],
    low: [],
  })

  React.useEffect(() => {
    const groupItems = async () => {
      const itemsWithPriority: QueueItemWithPriority[] = await Promise.all(
        queueItems.map(async item => ({
          ...item,
          calculatedPriority: await calculatePriority(item.content),
        }))
      )

      setPriorityGroups({
        high: itemsWithPriority.filter(item => item.calculatedPriority >= 0.7),
        medium: itemsWithPriority.filter(
          item =>
            item.calculatedPriority >= 0.4 && item.calculatedPriority < 0.7
        ),
        low: itemsWithPriority.filter(item => item.calculatedPriority < 0.4),
      })
    }

    void groupItems()
  }, [queueItems, calculatePriority])

  const getPriorityColor = (priority: PriorityLevel): string => {
    switch (priority) {
      case 'high':
        return 'bg-green-500/10 border-green-500/20'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'low':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const getTotalSize = (items: QueueItemWithPriority[]): number => {
    return items.reduce(
      (total: number, item: QueueItemWithPriority) =>
        total + (item.content.size || 0),
      0
    )
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <h3 className="mb-4 text-lg font-semibold text-white">
        Queue Priority Distribution
      </h3>

      <div className="space-y-4">
        {(['high', 'medium', 'low'] as const).map(priority => (
          <div
            key={priority}
            className={`rounded-lg border p-4 ${getPriorityColor(priority)}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium capitalize text-white">
                {priority} Priority
              </span>
              <span className="text-sm text-gray-400">
                {priorityGroups[priority].length} items
              </span>
            </div>

            {priorityGroups[priority].length > 0 && (
              <>
                <div className="mb-2 text-sm text-gray-400">
                  Total Size:{' '}
                  {formatBytes(getTotalSize(priorityGroups[priority]))}
                </div>

                <div className="max-h-32 space-y-2 overflow-y-auto">
                  {priorityGroups[priority].map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="mr-4 flex-1 truncate text-gray-300">
                        {item.content.title}
                      </span>
                      <span className="text-gray-400">
                        {(item.calculatedPriority * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {queueItems.length === 0 && (
        <p className="mt-4 text-center text-gray-400">No items in queue</p>
      )}
    </div>
  )
}
