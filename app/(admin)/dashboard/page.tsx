'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'

interface DashboardStats {
  totalUsers: number
  activeSubscriptions: number
  totalContent: number
  totalViews: number
  revenueThisMonth: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })

        // Fetch active subscriptions
        const { count: activeSubscriptions } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .eq('subscription_status', 'active')
          .not('subscription_tier', 'eq', 'free')

        // Fetch total content
        const { count: totalContent } = await supabase
          .from('content')
          .select('*', { count: 'exact' })

        // Fetch total views
        const { count: totalViews } = await supabase
          .from('viewing_history')
          .select('*', { count: 'exact' })

        // Calculate revenue this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        const { data: subscriptions } = await supabase
          .from('user_profiles')
          .select('subscription_tier')
          .eq('subscription_status', 'active')
          .gte('updated_at', startOfMonth.toISOString())

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
          activeSubscriptions: activeSubscriptions || 0,
          totalContent: totalContent || 0,
          totalViews: totalViews || 0,
          revenueThisMonth,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-white">{stats?.totalUsers}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Active Subscriptions</h3>
          <p className="mt-2 text-3xl font-bold text-white">{stats?.activeSubscriptions}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Content</h3>
          <p className="mt-2 text-3xl font-bold text-white">{stats?.totalContent}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-gray-400 text-sm font-medium">Revenue This Month</h3>
          <p className="mt-2 text-3xl font-bold text-white">R{stats?.revenueThisMonth}</p>
        </div>
      </div>

      {/* Add charts and graphs here */}
    </div>
  )
} 