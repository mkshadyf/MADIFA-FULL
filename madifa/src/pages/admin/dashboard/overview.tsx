

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsOverview from '@/components/admin/stats-overview'
import ActivityLog from '@/components/admin/activity-log'
import ContentCategories from '@/components/admin/content-categories'
import Loading from '@/components/ui/loading'

interface QuickStats {
  newUsers24h: number
  activeUsers24h: number
  newContent24h: number
  totalViews24h: number
}

export default function DashboardOverview() {
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

        // Get new users in last 24h
        const { count: newUsers } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .gte('created_at', twentyFourHoursAgo.toISOString())

        // Get active users in last 24h
        const { count: activeUsers } = await supabase
          .from('user_activity')
          .select('user_id', { count: 'exact', head: true })
          .gte('created_at', twentyFourHoursAgo.toISOString())

        // Get new content in last 24h
        const { count: newContent } = await supabase
          .from('content')
          .select('*', { count: 'exact' })
          .gte('created_at', twentyFourHoursAgo.toISOString())

        // Get total views in last 24h
        const { count: totalViews } = await supabase
          .from('viewing_history')
          .select('*', { count: 'exact' })
          .gte('created_at', twentyFourHoursAgo.toISOString())

        setQuickStats({
          newUsers24h: newUsers || 0,
          activeUsers24h: activeUsers || 0,
          newContent24h: newContent || 0,
          totalViews24h: totalViews || 0
        })
      } catch (error) {
        console.error('Error fetching quick stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuickStats()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400">New Users (24h)</h3>
          <p className="mt-2 text-3xl font-bold text-white">{quickStats?.newUsers24h}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400">Active Users (24h)</h3>
          <p className="mt-2 text-3xl font-bold text-white">{quickStats?.activeUsers24h}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400">New Content (24h)</h3>
          <p className="mt-2 text-3xl font-bold text-white">{quickStats?.newContent24h}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Views (24h)</h3>
          <p className="mt-2 text-3xl font-bold text-white">{quickStats?.totalViews24h}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Overall Statistics</h2>
          <StatsOverview />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Content Categories</h2>
          <ContentCategories />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <ActivityLog />
      </div>
    </div>
  )
} 
