'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { moderateContent, getModerationLogs } from '@/lib/services/moderation'
import type { ModerationAction } from '@/lib/services/moderation'

export default function ModerationInterface() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<Partial<ModerationAction>>({
    type: 'warn'
  })

  useEffect(() => {
    loadModerationLogs()
  }, [])

  const loadModerationLogs = async () => {
    try {
      const data = await getModerationLogs({ limit: 50 })
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
      await moderateContent({
        ...selectedAction,
        moderatorId: user.id
      } as ModerationAction)

      // Refresh logs
      loadModerationLogs()

      // Reset form
      setSelectedAction({ type: 'warn' })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Moderation action failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Moderation Action Form */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Take Action</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Action Type</label>
            <select
              value={selectedAction.type}
              onChange={(e) => setSelectedAction(prev => ({
                ...prev,
                type: e.target.value as ModerationAction['type']
              }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            >
              <option value="warn">Warn User</option>
              <option value="block">Block Content/User</option>
              <option value="delete">Delete Content</option>
              <option value="flag">Flag for Review</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Reason</label>
            <textarea
              value={selectedAction.reason || ''}
              onChange={(e) => setSelectedAction(prev => ({
                ...prev,
                reason: e.target.value
              }))}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            onClick={handleModeration}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Apply Action
          </button>
        </div>
      </div>

      {/* Moderation Logs */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Actions</h2>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border-l-4 border-red-500 pl-4 py-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">
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