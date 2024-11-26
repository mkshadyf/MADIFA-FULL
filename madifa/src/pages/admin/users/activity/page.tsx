

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ActivityLog from '@/components/admin/activity-log'
import UserActivityChart from '@/components/admin/user-activity-chart'
import Loading from '@/components/ui/loading'

interface ActivityMetrics {
  totalActivities: number
  uniqueUsers: number
  averageActivitiesPerUser: number
  mostActiveHour: number
  mostActiveDay: string
}

export default function UserActivity() {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // '24h', '7d', '30d', 'all'
  const supabase = createClient()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        let startDate = new Date()
        switch (timeRange) {
          case '24h':
            startDate.setHours(startDate.getHours() - 24)
            break
          case '7d':
            startDate.setDate(startDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(startDate.getDate() - 30)
            break
          case 'all':
            startDate = new Date(0) // Beginning of time
            break
        }

        // Get total activities
        const { count: totalActivities } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact' })
          .gte('created_at', startDate.toISOString())

        // Get unique users
        const { count: uniqueUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())

        // Get activity distribution by hour
        const { data: hourlyData } = await supabase
          .from('user_activity')
          .select('created_at')
          .gte('created_at', startDate.toISOString())

        const hourCounts = new Array(24).fill(0)
        hourlyData?.forEach(activity => {
          const hour = new Date(activity.created_at).getHours()
          hourCounts[hour]++
        })
        const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts))

        // Get activity distribution by day
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayCounts = new Array(7).fill(0)
        hourlyData?.forEach(activity => {
          const day = new Date(activity.created_at).getDay()
          dayCounts[day]++
        })
        const mostActiveDay = dayNames[dayCounts.indexOf(Math.max(...dayCounts))]

        setMetrics({
          totalActivities: totalActivities || 0,
          uniqueUsers: uniqueUsers || 0,
          averageActivitiesPerUser: totalActivities && uniqueUsers ? totalActivities / uniqueUsers : 0,
          mostActiveHour,
          mostActiveDay
        })
      } catch (error) {
        console.error('Error fetching activity metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [timeRange])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">User Activity</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 text-white rounded-md px-3 py-2 border border-gray-700"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Activities</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.totalActivities}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Unique Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.uniqueUsers}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Activities/User</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.averageActivitiesPerUser.toFixed(1)}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Peak Activity</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.mostActiveHour}:00
          </p>
          <p className="mt-1 text-sm text-gray-400">
            on {metrics?.mostActiveDay}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Activity Over Time</h2>
          <UserActivityChart />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <ActivityLog />
        </div>
      </div>
    </div>
  )
} 
