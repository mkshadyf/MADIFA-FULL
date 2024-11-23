'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ActivityLog {
  id: string
  user_id: string
  action: string
  details: string
  created_at: string
  user_profile?: {
    full_name: string
    email: string
  }
}

export default function ActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()

  const fetchActivities = async (pageNumber: number) => {
    try {
      const from = (pageNumber - 1) * 20
      const to = from + 19

      const { data, error } = await supabase
        .from('admin_activity_log')
        .select(`
          *,
          user_profile:user_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setActivities(prev => pageNumber === 1 ? data : [...prev, ...data])
      setHasMore(data.length === 20)
    } catch (error) {
      console.error('Error fetching activity log:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(page)
  }, [page])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  if (loading && page === 1) return <div>Loading activity log...</div>

  return (
    <div className="space-y-4">
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-700"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center ring-8 ring-gray-800">
                      {activity.user_profile?.full_name[0]}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-white">
                        {activity.user_profile?.full_name}{' '}
                        <span className="text-gray-400">{activity.action}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-gray-400">
                        {activity.details}
                      </p>
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-400">
                      {formatDate(activity.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
} 