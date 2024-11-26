

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ContentStats {
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  category: string
}

export default function ContentStats({ contentId }: { contentId: string }) {
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total views
        const { count: totalViews } = await supabase
          .from('viewing_history')
          .select('*', { count: 'exact' })
          .eq('content_id', contentId)

        // Get unique viewers
        const { count: uniqueViewers } = await supabase
          .from('viewing_history')
          .select('user_id', { count: 'exact', head: true })
          .eq('content_id', contentId)

        // Get average watch time and completion rate
        const { data: viewingData } = await supabase
          .from('viewing_history')
          .select('progress, duration')
          .eq('content_id', contentId)

        const totalWatchTime = viewingData?.reduce((sum, view) => sum + (view.progress || 0), 0) || 0
        const averageWatchTime = totalWatchTime / (viewingData?.length || 1)
        
        const completions = viewingData?.filter(view => 
          view.progress && view.duration && (view.progress / view.duration) >= 0.9
        ).length || 0
        const completionRate = (completions / (viewingData?.length || 1)) * 100

        // Get content category
        const { data: content } = await supabase
          .from('content')
          .select('category')
          .eq('id', contentId)
          .single()

        setStats({
          totalViews: totalViews || 0,
          uniqueViewers: uniqueViewers || 0,
          averageWatchTime,
          completionRate,
          category: content?.category || ''
        })
      } catch (error) {
        console.error('Error fetching content stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [contentId])

  if (loading) return <div>Loading stats...</div>
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
        <p className="mt-2 text-2xl font-bold text-white">{stats.totalViews}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Unique Viewers</h3>
        <p className="mt-2 text-2xl font-bold text-white">{stats.uniqueViewers}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Avg. Watch Time</h3>
        <p className="mt-2 text-2xl font-bold text-white">
          {Math.round(stats.averageWatchTime / 60)}m
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Completion Rate</h3>
        <p className="mt-2 text-2xl font-bold text-white">
          {Math.round(stats.completionRate)}%
        </p>
      </div>
    </div>
  )
} 
