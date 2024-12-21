import { useEffect, useState } from 'react'
import { useContent } from '@/hooks/useContent'
import type { Content } from '@/types/content'

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
  onCategorySelect,
}: ContentCategoryManagerProps) {
  const { data: contents } = useContent()
  const [categoryStats, setCategoryStats] = useState<Record<string, CategoryStats>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!contents) return

    const stats: Record<string, CategoryStats> = {}
    contents.forEach((content: Content) => {
      const category = content.category || 'Uncategorized'
      if (!stats[category]) {
        stats[category] = {
          count: 0,
          totalSize: 0,
          averageDuration: 0,
        }
      }

      stats[category].count++
      if (typeof content.size === 'number') {
        stats[category].totalSize += content.size
      }
      
      if (typeof content.duration === 'number') {
        stats[category].averageDuration =
          (stats[category].averageDuration * (stats[category].count - 1) +
            content.duration) /
          stats[category].count
      }
    })

    setCategoryStats(stats)
  }, [contents])

  const getTotalStorageUsage = (): number => {
    if (!contents) return 0
    return contents.reduce((total: number, content: Content) => 
      total + (typeof content.size === 'number' ? content.size : 0), 0)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    onCategorySelect?.(category)
    setIsExpanded(prev => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '0 min'
    const minutes = Math.round(seconds / 60)
    return `${minutes} min`
  }

  const formatSize = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatPercentage = (size: number): string => {
    const totalSize = getTotalStorageUsage()
    if (totalSize === 0 || !size || size <= 0) return '0%'
    return `${((size / totalSize) * 100).toFixed(1)}%`
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <h3 className="mb-4 text-lg font-semibold text-white">Categories</h3>

      <div className="space-y-4">
        {Object.entries(categoryStats)
          .sort(([, a], [, b]) => b.count - a.count)
          .map(([category, stats]) => (
            <div
              key={category}
              className={`rounded-lg border border-gray-800 p-3 transition-colors ${
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
                  <span className="font-medium text-white">{category}</span>
                  <span className="text-sm text-gray-400">
                    {stats.count} items
                  </span>
                </div>
              </button>

              {isExpanded[category] && (
                <div className="mt-3 space-y-2 border-t border-gray-800 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Size</span>
                    <span className="text-gray-300">
                      {formatSize(stats.totalSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. Duration</span>
                    <span className="text-gray-300">
                      {formatDuration(stats.averageDuration)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Usage</span>
                    <span className="text-gray-300">
                      {formatPercentage(stats.totalSize)}
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
