import { useEffect, useState } from 'react'

import type { Content } from '@/types/content'
import { useContent } from '@/hooks/useContent'

interface TagStats {
  count: number
  categories: Set<string>
  averageSize: number
}

interface ContentTagManagerProps {
  className?: string
  onTagSelect?: (tag: string) => void
}

export default function ContentTagManager({
  className = '',
  onTagSelect,
}: ContentTagManagerProps) {
  const { data: contents } = useContent()
  const [tagStats, setTagStats] = useState<Record<string, TagStats>>({})
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!contents) return

    const stats: Record<string, TagStats> = {}
    contents.forEach((content: Content) => {
      content.tags?.forEach((tag: string) => {
        if (!stats[tag]) {
          stats[tag] = {
            count: 0,
            categories: new Set(),
            averageSize: 0,
          }
        }

        stats[tag].count++
        stats[tag].categories.add(content.category)
        stats[tag].averageSize =
          (stats[tag].averageSize * (stats[tag].count - 1) +
            (content.size || 0)) /
          stats[tag].count
      })
    })

    setTagStats(stats)
  }, [contents])

  const handleTagClick = (tag: string) => {
    const newSelected = new Set(selectedTags)
    if (newSelected.has(tag)) {
      newSelected.delete(tag)
    } else {
      newSelected.add(tag)
    }
    setSelectedTags(newSelected)
    onTagSelect?.(tag)
  }

  const filteredTags = Object.entries(tagStats)
    .filter(([tag]) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b[1].count - a[1].count)

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Content Tags</h3>
        {selectedTags.size > 0 && (
          <button
            onClick={() => setSelectedTags(new Set())}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear Selection
          </button>
        )}
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
        />

        <div className="flex flex-wrap gap-2">
          {filteredTags.map(([tag, stats]) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                selectedTags.has(tag)
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{tag}</span>
              <span className="ml-2 text-xs opacity-70">{stats.count}</span>
            </button>
          ))}
        </div>

        {selectedTags.size > 0 && (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <h4 className="mb-2 text-sm font-medium text-gray-300">
              Selected Tags Info
            </h4>
            <div className="space-y-2">
              {Array.from(selectedTags).map(tag => (
                <div key={tag} className="text-sm">
                  <div className="mb-1 flex justify-between">
                    <span className="text-gray-400">Categories</span>
                    <span className="text-gray-300">
                      {tagStats[tag].categories.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. Size</span>
                    <span className="text-gray-300">
                      {(tagStats[tag].averageSize / (1024 * 1024)).toFixed(1)}{' '}
                      MB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
