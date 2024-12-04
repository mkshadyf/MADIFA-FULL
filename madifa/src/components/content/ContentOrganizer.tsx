import React, { useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import type { Content } from '@/types'
import { IconButton } from '../ui/button'

interface ContentOrganizerProps {
  className?: string
  onOrganize?: (organizedContent: Content[]) => void
}

export default function ContentOrganizer({ 
  className = '', 
  onOrganize 
}: ContentOrganizerProps) {
  const { contents, isLoading } = useContent()
  const { calculatePriority } = useQueuePriority()
  const [organizationMethod, setOrganizationMethod] = useState<
    'priority' | 'size' | 'date' | 'category'
  >('priority')
  const [isOrganizing, setIsOrganizing] = useState(false)

  const organizeContent = async () => {
    if (!contents || isOrganizing) return

    setIsOrganizing(true)
    try {
      let organizedContent: Content[] = [...contents]

      switch (organizationMethod) {
        case 'priority':
          const contentWithPriorities = await Promise.all(
            contents.map(async content => ({
              content,
              priority: await calculatePriority(content)
            }))
          )
          organizedContent = contentWithPriorities
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
          break

        case 'size':
          organizedContent.sort((a, b) => (a.size || 0) - (b.size || 0))
          break

        case 'date':
          organizedContent.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          break

        case 'category':
          organizedContent.sort((a, b) => a.category.localeCompare(b.category))
          break
      }

      onOrganize?.(organizedContent)
    } finally {
      setIsOrganizing(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-900 rounded-lg p-4`}>
        <p className="text-gray-400">Loading content...</p>
      </div>
    )
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Organize Content</h3>
        <IconButton
          icon="organize"
          onClick={organizeContent}
          disabled={isOrganizing}
          className={`${isOrganizing ? 'animate-spin' : ''}`}
          aria-label="Organize content"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Organization Method
          </label>
          <select
            value={organizationMethod}
            onChange={e => setOrganizationMethod(e.target.value as any)}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          >
            <option value="priority">By Priority</option>
            <option value="size">By Size</option>
            <option value="date">By Date</option>
            <option value="category">By Category</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Total Items</p>
            <p className="text-white font-medium">{contents?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-400">Categories</p>
            <p className="text-white font-medium">
              {new Set(contents?.map(c => c.category)).size}
            </p>
          </div>
        </div>

        {contents && contents.length > 0 && (
          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Category Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(
                contents.reduce((acc, content) => {
                  acc[content.category] = (acc[content.category] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-400">{category}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 