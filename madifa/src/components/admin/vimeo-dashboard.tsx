

import { useState, useEffect } from 'react'
import { Vimeo } from '@vimeo/vimeo'
import VimeoAnalytics from './vimeo-analytics'
import VimeoShowcaseManager from './vimeo-showcase-manager'
import VimeoUpload from './vimeo-upload'

interface DashboardStats {
  totalViews: number
  totalFinishes: number
  averageProgress: number
  totalWatchTime: number
}

export default function VimeoDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const vimeoClient = new Vimeo(
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
    )

    try {
      const response = await new Promise((resolve, reject) => {
        vimeoClient.request({
          method: 'GET',
          path: '/me/videos',
          query: {
            fields: 'stats',
            per_page: 100
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })

      const videos = (response as any).data
      const stats = videos.reduce((acc: DashboardStats, video: any) => {
        acc.totalViews += video.stats.plays || 0
        acc.totalFinishes += video.stats.finishes || 0
        acc.totalWatchTime += video.stats.total_time || 0
        return acc
      }, {
        totalViews: 0,
        totalFinishes: 0,
        averageProgress: 0,
        totalWatchTime: 0
      })

      stats.averageProgress = videos.length > 0
        ? (stats.totalFinishes / stats.totalViews) * 100
        : 0

      setStats(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-300">Total Views</h3>
            <p className="text-3xl font-bold text-white">{stats.totalViews}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-300">Completion Rate</h3>
            <p className="text-3xl font-bold text-white">
              {stats.averageProgress.toFixed(1)}%
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-300">Watch Time</h3>
            <p className="text-3xl font-bold text-white">
              {Math.round(stats.totalWatchTime / 3600)}h
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-300">Total Finishes</h3>
            <p className="text-3xl font-bold text-white">{stats.totalFinishes}</p>
          </div>
        </div>
      )}

      {/* Content Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Upload New Content</h2>
          <VimeoUpload onSuccess={loadStats} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Showcases</h2>
          <VimeoShowcaseManager />
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h2 className="text-xl font-bold mb-4">Detailed Analytics</h2>
        <VimeoAnalytics />
      </div>
    </div>
  )
} 
