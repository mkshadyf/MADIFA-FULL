import React, { useState, useEffect } from 'react'
import { useContent } from '@/hooks/useContent'
import { IconButton } from '../ui/button'

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
  onTagSelect
}: ContentTagManagerProps) {
  const { contents } = useContent()
  const [tagStats, setTagStats] = useState<Record<string, TagStats>>({})
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!contents) return

    const stats: Record<string, TagStats> = {}
    contents.forEach(content => {
      content.tags?.forEach(tag => {
        if (!stats[tag]) {
          stats[tag] = {
            count: 0,
            categories: new Set(),
            averageSize: 0
          }
        }

        stats[tag].count++
        stats[tag].categories.add(content.category)
        stats[tag].averageSize = (
          (stats[tag].averageSize * (stats[tag].count - 1) +
            (content.size || 0)) /
          stats[tag].count
        )
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
    .filter(([tag]) => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b[1].count - a[1].count)

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
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
          className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
        />

        <div className="flex flex-wrap gap-2">
          {filteredTags.map(([tag, stats]) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedTags.has(tag)
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{tag}</span>
              <span className="ml-2 text-xs opacity-70">
                {stats.count}
              </span>
            </button>
          ))}
        </div>

        {selectedTags.size > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Selected Tags Info
            </h4>
            <div className="space-y-2">
              {Array.from(selectedTags).map(tag => (
                <div key={tag} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Categories</span>
                    <span className="text-gray-300">
                      {tagStats[tag].categories.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. Size</span>
                    <span className="text-gray-300">
                      {(tagStats[tag].averageSize / (1024 * 1024)).toFixed(1)} MB
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