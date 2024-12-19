import React from 'react'

import { useQueueAnalytics } from '@/hooks/useQueueAnalytics'
import { useQueuePriority } from '@/hooks/useQueuePriority'

import { IconButton } from '../ui/button'

interface QueueRecommendationsProps {
  className?: string
  onOptimize?: () => void
}

export default function QueueRecommendations({
  className = '',
  onOptimize,
}: QueueRecommendationsProps) {
  const { efficiency, isLoading: isLoadingAnalytics } = useQueueAnalytics()
  const { isOptimizing, optimizeQueue } = useQueuePriority()

  const handleOptimize = async () => {
    await optimizeQueue()
    onOptimize?.()
  }

  if (isLoadingAnalytics || !efficiency) {
    return (
      <div className={`${className} rounded-lg bg-gray-900 p-4`}>
        <p className="text-gray-400">Loading recommendations...</p>
      </div>
    )
  }

  const getEfficiencyColor = (value: number) => {
    if (value >= 0.8) return 'text-green-500'
    if (value >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getEfficiencyLabel = (value: number) => {
    if (value >= 0.8) return 'Excellent'
    if (value >= 0.6) return 'Good'
    if (value >= 0.4) return 'Fair'
    return 'Poor'
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Queue Health</h3>
        <IconButton
          icon="optimize"
          onClick={handleOptimize}
          disabled={isOptimizing}
          className={`${isOptimizing ? 'animate-spin' : ''}`}
          aria-label="Optimize queue"
        />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div>
          <p className="mb-1 text-sm text-gray-400">Space Efficiency</p>
          <p
            className={`text-lg font-medium ${getEfficiencyColor(efficiency.spaceEfficiency)}`}
          >
            {getEfficiencyLabel(efficiency.spaceEfficiency)}
          </p>
          <p className="text-xs text-gray-500">
            {(efficiency.spaceEfficiency * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-400">Time Efficiency</p>
          <p
            className={`text-lg font-medium ${getEfficiencyColor(efficiency.timeEfficiency)}`}
          >
            {getEfficiencyLabel(efficiency.timeEfficiency)}
          </p>
          <p className="text-xs text-gray-500">
            {(efficiency.timeEfficiency * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="mb-1 text-sm text-gray-400">Priority Alignment</p>
          <p
            className={`text-lg font-medium ${getEfficiencyColor(efficiency.priorityAlignment)}`}
          >
            {getEfficiencyLabel(efficiency.priorityAlignment)}
          </p>
          <p className="text-xs text-gray-500">
            {(efficiency.priorityAlignment * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {efficiency.recommendations.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-300">
            Recommendations
          </h4>
          <ul className="space-y-2">
            {efficiency.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start space-x-2 text-sm text-gray-400"
              >
                <span className="mt-1 text-yellow-500">⚠</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
