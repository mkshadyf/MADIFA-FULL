import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { moderationService } from '@/lib/services/moderation'
import type { ModerationAction } from '@/types/moderation'

export default function ModerationInterface() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<
    Partial<ModerationAction>
  >({
    type: 'warn',
  })

  useEffect(() => {
    loadModerationLogs()
  }, [])

  const loadModerationLogs = async () => {
    try {
      const data = await moderationService.getModerationRules()
      setLogs(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  const handleModeration = async () => {
    if (!user) return

    try {
      await moderationService.takeModerationAction({
        ...selectedAction,
        moderator_id: user.id,
        content_id: selectedAction.content_id,
        created_at: new Date(),
      } as ModerationAction)

      // Refresh logs
      loadModerationLogs()

      // Reset form
      setSelectedAction({ type: 'warn' })
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Moderation action failed'
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Moderation Action Form */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Take Action</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Action Type
            </label>
            <select
              title="Action Type"
              value={selectedAction.type}
              onChange={e =>
                setSelectedAction(prev => ({
                  ...prev,
                  type: e.target.value as ModerationAction['type'],
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            >
              <option value="warn">Warn User</option>
              <option value="block">Block Content/User</option>
              <option value="delete">Delete Content</option>
              <option value="flag">Flag for Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Reason
            </label>
            <textarea
              title="Reason"
              value={selectedAction.reason || ''}
              onChange={e =>
                setSelectedAction(prev => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              rows={3}
            />
          </div>

          {error ? <div className="text-sm text-red-500">{error}</div> : null}

          <button
            onClick={handleModeration}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Apply Action
          </button>
        </div>
      </div>

      {/* Moderation Logs */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Recent Actions
        </h2>
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="border-l-4 border-red-500 py-2 pl-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">
                    {log.action_type.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-400">{log.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    by {log.moderator?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
