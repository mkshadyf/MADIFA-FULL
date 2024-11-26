

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalContent: number
  totalViews: number
  revenueThisMonth: number
  activeSubscriptions: number
  storageUsed: number
  bandwidthUsed: number
}

export default function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })

        // Get active users (logged in within last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const { count: activeUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString())

        // Get content stats
        const { count: totalContent } = await supabase
          .from('content')
          .select('*', { count: 'exact' })

        // Get viewing stats
        const { count: totalViews } = await supabase
          .from('viewing_history')
          .select('*', { count: 'exact' })

        // Get subscription stats
        const { data: subscriptions } = await supabase
          .from('user_profiles')
          .select('subscription_tier, subscription_status')
          .eq('subscription_status', 'active')
          .not('subscription_tier', 'eq', 'free')

        const activeSubscriptions = subscriptions?.length || 0
        const revenueThisMonth = (subscriptions || []).reduce((total, sub) => {
          switch (sub.subscription_tier) {
            case 'premium':
              return total + 60
            case 'premium_plus':
              return total + 120
            default:
              return total
          }
        }, 0)

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalContent: totalContent || 0,
          totalViews: totalViews || 0,
          revenueThisMonth,
          activeSubscriptions,
          storageUsed: 0, // TODO: Implement storage metrics
          bandwidthUsed: 0 // TODO: Implement bandwidth metrics
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading stats...</div>
  if (!stats) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
        <p className="mt-2 text-3xl font-bold text-white">{stats.totalUsers}</p>
        <p className="mt-1 text-sm text-gray-400">
          {stats.activeUsers} active in last 30 days
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400">Content</h3>
        <p className="mt-2 text-3xl font-bold text-white">{stats.totalContent}</p>
        <p className="mt-1 text-sm text-gray-400">
          {stats.totalViews} total views
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400">Revenue</h3>
        <p className="mt-2 text-3xl font-bold text-white">
          R{stats.revenueThisMonth}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {stats.activeSubscriptions} active subscriptions
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-400">Storage</h3>
        <p className="mt-2 text-3xl font-bold text-white">
          {(stats.storageUsed / 1024 / 1024 / 1024).toFixed(1)} GB
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {(stats.bandwidthUsed / 1024 / 1024 / 1024).toFixed(1)} GB bandwidth
        </p>
      </div>
    </div>
  )
} 
