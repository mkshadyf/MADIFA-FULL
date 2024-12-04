import React, { useState, useEffect } from 'react'
import { useContent } from '@/hooks/useContent'
import { IconButton } from '../ui/button'

interface CategoryStats {
  count: number
  totalSize: number
  averageDuration: number
}

interface ContentCategoryManagerProps {
  className?: string
  onCategorySelect?: (category: string) => void
}

export default function ContentCategoryManager({
  className = '',
  onCategorySelect
}: ContentCategoryManagerProps) {
  const { contents } = useContent()
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!contents) return

    const stats: Record<string, CategoryStats> = {}
    contents.forEach(content => {
      const category = content.category
      if (!stats[category]) {
        stats[category] = {
          count: 0,
          totalSize: 0,
          averageDuration: 0
        }
      }

      stats[category].count++
      stats[category].totalSize += content.size || 0
      stats[category].averageDuration =
        (stats[category].averageDuration * (stats[category].count - 1) +
          (content.duration || 0)) /
        stats[category].count
    })

    setCategoryStats(stats)
  }, [contents])

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    onCategorySelect?.(category)
    setIsExpanded(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>

      <div className="space-y-4">
        {Object.entries(categoryStats)
          .sort(([, a], [, b]) => b.count - a.count)
          .map(([category, stats]) => (
            <div
              key={category}
              className={`border border-gray-800 rounded-lg p-3 transition-colors ${
                selectedCategory === category
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'hover:border-gray-700'
              }`}
            >
              <button
                onClick={() => handleCategoryClick(category)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{category}</span>
                  <span className="text-gray-400 text-sm">{stats.count} items</span>
                </div>
              </button>

              {isExpanded[category] && (
                <div className="mt-3 pt-3 border-t border-gray-800 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Size</span>
                    <span className="text-gray-300">
                      {(stats.totalSize / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. Duration</span>
                    <span className="text-gray-300">
                      {Math.round(stats.averageDuration / 60)} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Usage</span>
                    <span className="text-gray-300">
                      {((stats.totalSize / (contents?.reduce((total, content) => total + (content.size || 0), 0) || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
} 