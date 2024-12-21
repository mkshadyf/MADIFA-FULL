import React from "react"
import { useEffect, useState } from 'react'

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
          .select(
            `
            *,
            user_profile:user_profiles(full_name, email),
            content:content(title)
          `
          )
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

    void fetchActivities()
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
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
            >
              User
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
            >
              Action
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
            >
              Content
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300"
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-800">
          {activities.map(activity => (
            <tr key={activity.id}>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-white">
                  {activity.user_profile?.full_name}
                </div>
                <div className="text-sm text-gray-400">
                  {activity.user_profile?.email}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className="inline-flex rounded-full bg-indigo-100 px-2 text-xs font-semibold leading-5 text-indigo-800">
                  {formatAction(activity.action)}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                {activity.content?.title || '-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                {formatDate(activity.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
