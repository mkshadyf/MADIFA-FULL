import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import UserActivityChart from '@/components/admin/user-activity-chart'

interface UserMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  subscriptionTiers: {
    free: number
    premium: number
    premium_plus: number
  }
  subscriptionStatus: {
    active: number
    inactive: number
    past_due: number
  }
  userRetention: number
  averageSessionDuration: number
}

type SubscriptionTier = 'free' | 'premium' | 'premium_plus'
type SubscriptionStatus = 'active' | 'inactive' | 'past_due'

export default function UserAnalytics() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
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
            startDate = new Date(0)
            break
        }

        // Get total users
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })

        // Get active users
        const { count: activeUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())

        // Get new users
        const { count: newUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .gte('created_at', startDate.toISOString())

        // Get subscription stats
        const { data: subscriptions } = await supabase
          .from('user_profiles')
          .select('subscription_tier, subscription_status')

        const subscriptionTiers = {
          free: 0,
          premium: 0,
          premium_plus: 0,
        }

        const subscriptionStatus = {
          active: 0,
          inactive: 0,
          past_due: 0,
        }

        subscriptions?.forEach(sub => {
          const tier = sub.subscription_tier as SubscriptionTier
          const status = sub.subscription_status as SubscriptionStatus
          if (tier in subscriptionTiers) {
            subscriptionTiers[tier]++
          }
          if (status in subscriptionStatus) {
            subscriptionStatus[status]++
          }
        })

        // Calculate user retention
        const previousPeriodStart = new Date(startDate)
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 30)

        const { count: previousUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .lte('created_at', startDate.toISOString())
          .gte('created_at', previousPeriodStart.toISOString())

        const { count: retainedUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .lte('created_at', new Date().toISOString())

        const userRetention = previousUsers
          ? ((retainedUsers || 0) / previousUsers) * 100
          : 0

        // Calculate average session duration
        const { data: sessions } = await supabase
          .from('user_activity')
          .select('duration')
          .gte('created_at', startDate.toISOString())

        const totalDuration =
          sessions?.reduce(
            (sum, session) => sum + (session.duration || 0),
            0
          ) || 0
        const averageSessionDuration = sessions?.length
          ? totalDuration / sessions.length
          : 0

        setMetrics({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsers: newUsers || 0,
          churnedUsers: (totalUsers || 0) - (activeUsers || 0),
          subscriptionTiers,
          subscriptionStatus,
          userRetention,
          averageSessionDuration,
        })
      } catch (error) {
        console.error('Error fetching user metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [timeRange])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">User Analytics</h1>
        <select
          title="Time Range"
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.totalUsers}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {metrics?.newUsers} new in this period
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.activeUsers}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {metrics?.churnedUsers} churned
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">User Retention</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {Math.round(metrics?.userRetention || 0)}%
          </p>
          <p className="mt-1 text-sm text-gray-400">vs previous period</p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Avg. Session</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {Math.round((metrics?.averageSessionDuration || 0) / 60)}m
          </p>
          <p className="mt-1 text-sm text-gray-400">per user</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Subscription Tiers
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Free</span>
              <span className="font-medium text-white">
                {metrics?.subscriptionTiers.free}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Premium</span>
              <span className="font-medium text-white">
                {metrics?.subscriptionTiers.premium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Premium Plus</span>
              <span className="font-medium text-white">
                {metrics?.subscriptionTiers.premium_plus}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Subscription Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Active</span>
              <span className="font-medium text-white">
                {metrics?.subscriptionStatus.active}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Inactive</span>
              <span className="font-medium text-white">
                {metrics?.subscriptionStatus.inactive}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Past Due</span>
              <span className="font-medium text-white">
                {metrics?.subscriptionStatus.past_due}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-white">Activity Trends</h2>
        <UserActivityChart />
      </div>
    </div>
  )
}
