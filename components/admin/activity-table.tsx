'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Activity {
  id: string
  user_id: string
  action: string
  content_id?: string
  metadata?: Record<string, any>
  created_at: string
  user_profile?: {
    full_name: string
    email: string
  }
  content?: {
    title: string
  }
}

export default function ActivityTable() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data, error } = await supabase
          .from('user_activity')
          .select(`
            *,
            user_profile:user_profiles(full_name, email),
            content:content(title)
          `)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) throw error
        setActivities(data || [])
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const formatAction = (action: string) => {
    return action.replace('_', ' ').toLowerCase()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              User
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Action
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Content
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-white">{activity.user_profile?.full_name}</div>
                <div className="text-sm text-gray-400">{activity.user_profile?.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {formatAction(activity.action)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {activity.content?.title || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(activity.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 