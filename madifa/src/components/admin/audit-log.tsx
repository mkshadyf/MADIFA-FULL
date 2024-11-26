

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AuditEntry {
  id: string
  action: string
  entity_type: 'user' | 'content' | 'system' | 'role'
  entity_id: string
  changes: Record<string, any>
  performed_by: string
  performed_at: string
  user_profile?: {
    full_name: string
    email: string
  }
}

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [filter, page])

  const fetchEntries = async () => {
    try {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          user_profile:performed_by(
            full_name,
            email
          )
        `)
        .order('performed_at', { ascending: false })
        .range((page - 1) * 20, page * 20 - 1)

      if (filter !== 'all') {
        query = query.eq('entity_type', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setEntries(prev => page === 1 ? data : [...prev, ...data])
      setHasMore(data.length === 20)
    } catch (error) {
      console.error('Error fetching audit log:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value]) => (
      <div key={key} className="text-sm">
        <span className="text-gray-400">{key}:</span>{' '}
        <span className="text-white">{JSON.stringify(value)}</span>
      </div>
    ))
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'text-green-400'
      case 'update':
        return 'text-blue-400'
      case 'delete':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (loading && page === 1) return <div>Loading audit log...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Audit Log</h2>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(1)
          }}
          className="bg-gray-800 text-white rounded-md px-3 py-2 border border-gray-700"
        >
          <option value="all">All Events</option>
          <option value="user">User Events</option>
          <option value="content">Content Events</option>
          <option value="system">System Events</option>
          <option value="role">Role Events</option>
        </select>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                  {entry.action}
                </span>
                <span className="text-sm text-gray-400 ml-2">
                  {entry.entity_type} ({entry.entity_id})
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white">
                  {entry.user_profile?.full_name}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(entry.performed_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              {formatChanges(entry.changes)}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No audit entries found
        </div>
      )}
    </div>
  )
} 
