import { useAuth } from '@/hooks/useAuth'
import type { Content } from '@/types/content'
import { useState } from 'react'

interface SecurityManagerProps {
  content: Content
  onUpdate: (updates: Partial<Content>) => void
}

export function SecurityManager({ content, onUpdate }: SecurityManagerProps) {
  const { user } = useAuth()
  const [, setIsEditing] = useState(false)

  const handleVisibilityChange = (visibility: Content['visibility']) => {
    onUpdate({ visibility })
    setIsEditing(false)
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="text-lg font-semibold">Security Settings</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Visibility</label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleVisibilityChange('public')}
            className={`rounded-md px-3 py-1 text-sm ${
              content.visibility === 'public'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => handleVisibilityChange('private')}
            className={`rounded-md px-3 py-1 text-sm ${
              content.visibility === 'private'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Private
          </button>
          <button
            type="button"
            onClick={() => handleVisibilityChange('unlisted')}
            className={`rounded-md px-3 py-1 text-sm ${
              content.visibility === 'unlisted'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Unlisted
          </button>
        </div>
      </div>

      {content.visibility === 'private' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Access Control</label>
          <p className="text-sm text-gray-500">
            This content is only visible to authorized users.
          </p>
        </div>
      )}

      {content.visibility === 'unlisted' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Share Link</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={`${window.location.origin}/watch/${content.id}`}
              readOnly
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/watch/${content.id}`
                )
              }}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
