'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ContentStats from './content-stats'
import ContentCategories from './content-categories'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface AnalyticsMetrics {
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  popularContent: {
    content: Content
    views: number
    completions: number
  }[]
  viewsByCategory: Record<string, number>
  viewsByDay: number[]
  viewsByHour: number[]
}

export default function ContentAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
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

        // Get viewing stats
        const { data: viewingData } = await supabase
          .from('viewing_history')
          .select(`
            *,
            content:content_id(*)
          `)
          .gte('created_at', startDate.toISOString())

        if (!viewingData) return

        // Calculate metrics
        const totalViews = viewingData.length
        const uniqueViewers = new Set(viewingData.map(v => v.user_id)).size
        const totalWatchTime = viewingData.reduce((sum, view) => sum + (view.duration || 0), 0)
        const averageWatchTime = totalWatchTime / totalViews
        const completions = viewingData.filter(view => 
          view.progress && view.duration && (view.progress / view.duration) >= 0.9
        ).length
        const completionRate = (completions / totalViews) * 100

        // Calculate views by category
        const viewsByCategory = viewingData.reduce((acc: Record<string, number>, view) => {
          const category = view.content?.category
          if (category) {
            acc[category] = (acc[category] || 0) + 1
          }
          return acc
        }, {})

        // Calculate views by hour and day
        const viewsByHour = new Array(24).fill(0)
        const viewsByDay = new Array(7).fill(0)
        viewingData.forEach(view => {
          const date = new Date(view.created_at)
          viewsByHour[date.getHours()]++
          viewsByDay[date.getDay()]++
        })

        // Get popular content
        const contentViews = viewingData.reduce((acc: Record<string, any>, view) => {
          const contentId = view.content_id
          if (!acc[contentId]) {
            acc[contentId] = {
              content: view.content,
              views: 0,
              completions: 0
            }
          }
          acc[contentId].views++
          if (view.progress && view.duration && (view.progress / view.duration) >= 0.9) {
            acc[contentId].completions++
          }
          return acc
        }, {})

        const popularContent = Object.values(contentViews)
          .sort((a: any, b: any) => b.views - a.views)
          .slice(0, 5)

        setMetrics({
          totalViews,
          uniqueViewers,
          averageWatchTime,
          completionRate,
          popularContent,
          viewsByCategory,
          viewsByDay,
          viewsByHour
        })
      } catch (error) {
        console.error('Error fetching analytics metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [timeRange])

  if (loading) return <div>Loading analytics...</div>
  if (!metrics) return null

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

      {/* Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics.totalViews}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Unique Viewers</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics.uniqueViewers}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Avg. Watch Time</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {Math.round(metrics.averageWatchTime / 60)}m
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Completion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {Math.round(metrics.completionRate)}%
          </p>
        </div>
      </div>

      {/* Popular content */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Popular Content</h3>
        <div className="space-y-4">
          {metrics.popularContent.map(({ content, views, completions }) => (
            <div key={content.id} className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{content.title}</p>
                <p className="text-sm text-gray-400">{content.category}</p>
              </div>
              <div className="text-right">
                <p className="text-white">{views} views</p>
                <p className="text-sm text-gray-400">
                  {Math.round((completions / views) * 100)}% completion
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentCategories />
        <ContentStats contentId={metrics.popularContent[0]?.content.id} />
      </div>
    </div>
  )
} 