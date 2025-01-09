import { vimeoClient } from '@/lib/services/vimeo/vimeo-client'
import type { VimeoVideo } from '@/types/vimeo'
import { useEffect, useState } from 'react'

interface VideoAnalytics {
  id: string
  title: string
  views: number
  finishes: number
  finishRate: number
  watchTime: number
}

export function VimeoAnalytics() {
  const [videos, setVideos] = useState<VideoAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideoAnalytics()
  }, [])

  const loadVideoAnalytics = async () => {
    try {
      const response = await vimeoClient.request<VimeoVideo>({
        method: 'GET',
        path: '/me/videos',
        query: {
          fields: 'uri,name,stats',
          per_page: 100,
        },
      })

      const videoAnalytics = response.data.map(video => ({
        id: video.uri.split('/').pop() || '',
        title: video.name,
        views: video.stats?.plays || 0,
        finishes: video.stats?.finishes || 0,
        finishRate: video.stats?.plays
          ? ((video.stats.finishes || 0) / video.stats.plays) * 100
          : 0,
        watchTime: video.stats?.loads || 0,
      }))

      setVideos(videoAnalytics.sort((a, b) => b.views - a.views))
    } catch (error) {
      console.error('Error loading video analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center">Loading analytics...</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
              Video
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">
              Views
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">
              Finishes
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">
              Finish Rate
            </th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-300">
              Watch Time
            </th>
          </tr>
        </thead>
        <tbody>
          {videos.map(video => (
            <tr key={video.id} className="border-b border-gray-800">
              <td className="px-4 py-2 text-sm text-gray-300">{video.title}</td>
              <td className="px-4 py-2 text-right text-sm text-gray-300">
                {video.views.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right text-sm text-gray-300">
                {video.finishes.toLocaleString()}
              </td>
              <td className="px-4 py-2 text-right text-sm text-gray-300">
                {video.finishRate.toFixed(1)}%
              </td>
              <td className="px-4 py-2 text-right text-sm text-gray-300">
                {Math.round(video.watchTime / 3600)}h
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
