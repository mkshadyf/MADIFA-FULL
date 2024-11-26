

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface ActivityMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  retentionRate: number
  averageSessionTime: number
  topUsers: {
    user: UserProfile
    activityCount: number
  }[]
  activityByHour: number[]
  activityByDay: number[]
}

export default function UserActivityMetrics() {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Get daily active users
        const { count: dailyActiveUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', oneDayAgo.toISOString())

        // Get weekly active users
        const { count: weeklyActiveUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString())

        // Get monthly active users
        const { count: monthlyActiveUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', oneMonthAgo.toISOString())

        // Get activity distribution by hour and day
        const { data: activityData } = await supabase
          .from('user_activity')
          .select('created_at')
          .gte('created_at', oneWeekAgo.toISOString())

        const hourCounts = new Array(24).fill(0)
        const dayCounts = new Array(7).fill(0)

        activityData?.forEach(activity => {
          const date = new Date(activity.created_at)
          hourCounts[date.getHours()]++
          dayCounts[date.getDay()]++
        })

        // Get top users by activity
        const { data: topUsersData } = await supabase
          .from('user_activity')
          .select(`
            user_id,
            count,
            user_profiles!inner(*)
          `)
          .gte('created_at', oneMonthAgo.toISOString())
          .group('user_id')
          .order('count', { ascending: false })
          .limit(5)

        const topUsers = topUsersData?.map(data => ({
          user: data.user_profiles as UserProfile,
          activityCount: parseInt(data.count as unknown as string)
        })) || []

        // Calculate retention rate
        const { count: previousMonthUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', new Date(oneMonthAgo.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .lte('created_at', oneMonthAgo.toISOString())

        const { count: retainedUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', oneMonthAgo.toISOString())

        const retentionRate = previousMonthUsers ? (retainedUsers || 0) / previousMonthUsers * 100 : 0

        // Calculate average session time
        const { data: sessions } = await supabase
          .from('user_activity')
          .select('duration')
          .gte('created_at', oneMonthAgo.toISOString())

        const totalDuration = sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0
        const averageSessionTime = sessions?.length ? totalDuration / sessions.length : 0

        setMetrics({
          dailyActiveUsers: dailyActiveUsers || 0,
          weeklyActiveUsers: weeklyActiveUsers || 0,
          monthlyActiveUsers: monthlyActiveUsers || 0,
          retentionRate,
          averageSessionTime,
          topUsers,
          activityByHour: hourCounts,
          activityByDay: dayCounts
        })
      } catch (error) {
        console.error('Error fetching activity metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) return <div>Loading metrics...</div>
  if (!metrics) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
          <div className="mt-2 space-y-2">
            <p className="text-2xl font-bold text-white">{metrics.dailyActiveUsers}</p>
            <p className="text-sm text-gray-400">Daily Active Users</p>
            <p className="text-lg font-semibold text-white">{metrics.weeklyActiveUsers}</p>
            <p className="text-sm text-gray-400">Weekly Active Users</p>
            <p className="text-lg font-semibold text-white">{metrics.monthlyActiveUsers}</p>
            <p className="text-sm text-gray-400">Monthly Active Users</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Engagement</h3>
          <div className="mt-2 space-y-2">
            <p className="text-2xl font-bold text-white">
              {Math.round(metrics.retentionRate)}%
            </p>
            <p className="text-sm text-gray-400">30-Day Retention Rate</p>
            <p className="text-lg font-semibold text-white">
              {Math.round(metrics.averageSessionTime / 60)}m
            </p>
            <p className="text-sm text-gray-400">Average Session Time</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Top Users</h3>
          <div className="mt-2 space-y-3">
            {metrics.topUsers.map(({ user, activityCount }) => (
              <div key={user.id} className="flex justify-between items-center">
                <div className="text-sm text-white">{user.email}</div>
                <div className="text-sm text-gray-400">{activityCount} activities</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Activity by Hour</h3>
          <div className="h-48 flex items-end space-x-2">
            {metrics.activityByHour.map((count, hour) => (
              <div
                key={hour}
                className="flex-1 bg-indigo-500 rounded-t"
                style={{
                  height: `${(count / Math.max(...metrics.activityByHour)) * 100}%`
                }}
                title={`${hour}:00 - ${count} activities`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>00:00</span>
            <span>12:00</span>
            <span>23:00</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Activity by Day</h3>
          <div className="h-48 flex items-end space-x-4">
            {metrics.activityByDay.map((count, day) => (
              <div key={day} className="flex-1 space-y-2">
                <div
                  className="bg-indigo-500 rounded-t"
                  style={{
                    height: `${(count / Math.max(...metrics.activityByDay)) * 100}%`
                  }}
                />
                <div className="text-center text-xs text-gray-400">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
