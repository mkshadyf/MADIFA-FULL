'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import ContentStats from '@/components/admin/content-stats'
import UserActivityChart from '@/components/admin/user-activity-chart'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface ContentAnalytics {
  id: string
  title: string
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
}

export default function ContentAnalytics() {
  const [content, setContent] = useState<Content[]>([])
  const [analytics, setAnalytics] = useState<ContentAnalytics[]>([])
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d') // '24h', '7d', '30d', 'all'
  const supabase = createClient()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setContent(data || [])

        // Fetch analytics for each content
        const analyticsData = await Promise.all(
          data.map(async (item) => {
            const stats = await fetchContentStats(item.id)
            return {
              id: item.id,
              title: item.title,
              ...stats
            }
          })
        )

        setAnalytics(analyticsData)
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [timeRange])

  const fetchContentStats = async (contentId: string) => {
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

    const { data: viewingData } = await supabase
      .from('viewing_history')
      .select('*')
      .eq('content_id', contentId)
      .gte('created_at', startDate.toISOString())

    const totalViews = viewingData?.length || 0
    const uniqueViewers = new Set(viewingData?.map(v => v.user_id)).size
    const totalWatchTime = viewingData?.reduce((sum, view) => sum + (view.progress || 0), 0) || 0
    const averageWatchTime = totalWatchTime / (viewingData?.length || 1)
    const completions = viewingData?.filter(view => 
      view.progress && view.duration && (view.progress / view.duration) >= 0.9
    ).length || 0
    const completionRate = (completions / (viewingData?.length || 1)) * 100

    return {
      totalViews,
      uniqueViewers,
      averageWatchTime,
      completionRate
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Content Analytics</h1>
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

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Content
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Unique Viewers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Avg. Watch Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Completion Rate
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {analytics.map((item) => (
              <tr 
                key={item.id}
                className="cursor-pointer hover:bg-gray-750"
                onClick={() => setSelectedContent(item.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{item.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.totalViews}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {item.uniqueViewers}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Math.round(item.averageWatchTime / 60)}m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {Math.round(item.completionRate)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedContent && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Detailed Analytics</h2>
          <ContentStats contentId={selectedContent} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Viewing Trends</h2>
        <UserActivityChart />
      </div>
    </div>
  )
} 