import { useState } from 'react'
import type { Content } from '@/types'

import { useContent } from '@/hooks/useContent'
import { useQueuePriority } from '@/hooks/useQueuePriority'

import { IconButton } from '../ui/button'

interface ContentOrganizerProps {
  className?: string
  onOrganize?: (organizedContent: Content[]) => void
}

export default function ContentOrganizer({
  className = '',
  onOrganize,
}: ContentOrganizerProps) {
  const { data: contents, isLoading } = useContent()
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
            contents.map(async (content: Content) => ({
              content,
              priority: await calculatePriority(content),
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
          organizedContent.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
            return dateB - dateA
          })
          break

        case 'category':
          organizedContent.sort((a, b) =>
            (a.category || '').localeCompare(b.category || '')
          )
          break
      }

      onOrganize?.(organizedContent)
    } finally {
      setIsOrganizing(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`${className} rounded-lg bg-gray-900 p-4`}>
        <p className="text-gray-400">Loading content...</p>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Organize Content</h3>
        <IconButton
          label="Organize content"
          icon="organize"
          onClick={organizeContent}
          disabled={isOrganizing}
          className={`${isOrganizing ? 'animate-spin' : ''}`}
          aria-label="Organize content"
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Organization Method
          </label>
          <select
            aria-label="Organization Method"
            value={organizationMethod}
            onChange={e => setOrganizationMethod(e.target.value as any)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
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
            <p className="font-medium text-white">{contents?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-400">Categories</p>
            <p className="font-medium text-white">
              {new Set(contents?.map((c: Content) => c.category || '')).size}
            </p>
          </div>
        </div>

        {contents && contents.length > 0 ? (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <h4 className="mb-2 text-sm font-medium text-gray-300">
              Category Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(
                contents.reduce(
                  (acc: Record<string, number>, content: Content) => {
                    acc[content.category || ''] =
                      (acc[content.category || ''] || 0) + 1
                    return acc
                  },
                  {}
                )
              ).map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-400">{category}</span>
                  <span className="text-gray-300">{count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
