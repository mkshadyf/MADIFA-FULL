import { vimeoClient } from '@/lib/services/vimeo/vimeo-client'
import { useEffect, useState } from 'react'
import { VimeoAnalytics } from './vimeo-analytics'
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
  const [, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const stats = await vimeoClient.getVideoStats()
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
      {stats ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-800 p-6">
            <h3 className="text-lg font-medium text-gray-300">Total Views</h3>
            <p className="text-3xl font-bold text-white">{stats.totalViews}</p>
          </div>
          <div className="rounded-lg bg-gray-800 p-6">
            <h3 className="text-lg font-medium text-gray-300">
              Completion Rate
            </h3>
            <p className="text-3xl font-bold text-white">
              {stats.averageProgress.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-gray-800 p-6">
            <h3 className="text-lg font-medium text-gray-300">Watch Time</h3>
            <p className="text-3xl font-bold text-white">
              {Math.round(stats.totalWatchTime / 3600)}h
            </p>
          </div>
          <div className="rounded-lg bg-gray-800 p-6">
            <h3 className="text-lg font-medium text-gray-300">
              Total Finishes
            </h3>
            <p className="text-3xl font-bold text-white">
              {stats.totalFinishes}
            </p>
          </div>
        </div>
      ) : null}

      {/* Content Management */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold">Upload New Content</h2>
          <VimeoUpload />
        </div>
        <div>
          <h2 className="mb-4 text-xl font-bold">Showcases</h2>
          <VimeoShowcaseManager />
        </div>
      </div>

      {/* Analytics */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Detailed Analytics</h2>
        <VimeoAnalytics />
      </div>
    </div>
  )
}
