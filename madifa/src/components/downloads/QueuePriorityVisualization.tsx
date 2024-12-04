import React from 'react'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { formatBytes } from '@/lib/utils/format'

interface QueuePriorityVisualizationProps {
  className?: string
}

export default function QueuePriorityVisualization({
  className = ''
}: QueuePriorityVisualizationProps) {
  const { queueItems } = useDownloadQueue()
  const { calculatePriority } = useQueuePriority()
  const [priorityGroups, setPriorityGroups] = React.useState<{
    high: typeof queueItems
    medium: typeof queueItems
    low: typeof queueItems
  }>({
    high: [],
    medium: [],
    low: []
  })

  React.useEffect(() => {
    const groupItems = async () => {
      const itemsWithPriority = await Promise.all(
        queueItems.map(async item => ({
          ...item,
          calculatedPriority: await calculatePriority(item.content)
        }))
      )

      setPriorityGroups({
        high: itemsWithPriority.filter(item => item.calculatedPriority >= 0.7),
        medium: itemsWithPriority.filter(item => item.calculatedPriority >= 0.4 && item.calculatedPriority < 0.7),
        low: itemsWithPriority.filter(item => item.calculatedPriority < 0.4)
      })
    }

    groupItems()
  }, [queueItems, calculatePriority])

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
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

  const getTotalSize = (items: typeof queueItems) => {
    return items.reduce((total, item) => total + (item.content.size || 0), 0)
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <h3 className="text-lg font-semibold text-white mb-4">Queue Priority Distribution</h3>

      <div className="space-y-4">
        {(['high', 'medium', 'low'] as const).map(priority => (
          <div
            key={priority}
            className={`p-4 rounded-lg border ${getPriorityColor(priority)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium capitalize">{priority} Priority</span>
              <span className="text-sm text-gray-400">
                {priorityGroups[priority].length} items
              </span>
            </div>

            {priorityGroups[priority].length > 0 && (
              <>
                <div className="text-sm text-gray-400 mb-2">
                  Total Size: {formatBytes(getTotalSize(priorityGroups[priority]))}
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {priorityGroups[priority].map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-300 truncate flex-1 mr-4">
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
        <p className="text-gray-400 text-center mt-4">
          No items in queue
        </p>
      )}
    </div>
  )
} 