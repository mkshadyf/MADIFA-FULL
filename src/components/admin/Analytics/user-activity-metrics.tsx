import { useEffect, useState } from 'react'
import type { UserProfile } from '@/types/auth'
import { getRelativeDates } from '@/lib/utils/date'
import {
  getActivityDistribution,
  getAverageSessionTime,
  getRetentionRate,
  getTopUsersByActivity,
  getUserActivityCounts,
  type TopUser,
} from '@/lib/services/analytics/activity-metrics'

interface ActivityMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  retentionRate: number
  averageSessionTime: number
  topUsers: TopUser[]
  activityByHour: number[]
  activityByDay: number[]
}

export default function UserActivityMetrics() {
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { oneDayAgo, oneWeekAgo, oneMonthAgo } = getRelativeDates()

        // Get active users counts
        const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers] =
          await Promise.all([
            getUserActivityCounts(oneDayAgo),
            getUserActivityCounts(oneWeekAgo),
            getUserActivityCounts(oneMonthAgo),
          ])

        // Get activity distribution
        const { hourCounts: activityByHour, dayCounts: activityByDay } =
          await getActivityDistribution(oneWeekAgo)

        // Get top users
        const topUsers = await getTopUsersByActivity(oneMonthAgo, 5)

        // Calculate retention rate
        const retentionRate = await getRetentionRate(
          oneMonthAgo,
          new Date(oneMonthAgo.getTime() - 30 * 24 * 60 * 60 * 1000)
        )

        // Get average session time
        const averageSessionTime = await getAverageSessionTime(oneMonthAgo)

        setMetrics({
          dailyActiveUsers,
          weeklyActiveUsers,
          monthlyActiveUsers,
          retentionRate,
          averageSessionTime,
          topUsers,
          activityByHour,
          activityByDay,
        })
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchMetrics()
  }, [])

  if (loading) return <div>Loading...</div>
  if (!metrics) return <div>No data available</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Daily Active Users"
          value={metrics.dailyActiveUsers}
        />
        <MetricCard
          title="Weekly Active Users"
          value={metrics.weeklyActiveUsers}
        />
        <MetricCard
          title="Monthly Active Users"
          value={metrics.monthlyActiveUsers}
        />
        <MetricCard
          title="Retention Rate"
          value={`${(metrics.retentionRate * 100).toFixed(1)}%`}
        />
      </div>

      {/* Add your existing UI components here */}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
