import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { vimeoService } from '@/lib/services/vimeo/vimeo-service'
import type { VimeoVideo } from '@/types/vimeo'
import { useEffect, useState } from 'react'

// ==================== Types ====================

interface VideoAnalytics {
  id: string
  title: string
  views: number
  finishes: number
  finishRate: number
  watchTime: number
}

interface SingleVideoAnalyticsProps {
  video: VimeoVideo
  className?: string
}

interface VideoListAnalyticsProps {
  className?: string
}

// ==================== SingleVideoAnalytics ====================

/**
 * Component to display analytics for a single video
 */
export function SingleVideoAnalytics({ video, className = '' }: SingleVideoAnalyticsProps) {
  // Safety check for undefined stats
  const stats = video.stats || { plays: 0, finishes: 0, likes: 0, comments: 0 }
  const completionRate = stats.plays > 0 ? ((stats.finishes / stats.plays) * 100).toFixed(1) : '0'

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Total Views</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.plays || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Completion Rate</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{completionRate}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Likes</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.likes || 0}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Comments</h3>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.comments || 0}</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== VideoAnalyticsDashboard ====================

/**
 * Component to display analytics for all videos
 */
export function VideoAnalyticsDashboard({ className = '' }: VideoListAnalyticsProps) {
  const [videos, setVideos] = useState<VideoAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideoAnalytics()
  }, [])

  const loadVideoAnalytics = async () => {
    try {
      const { videos } = await vimeoService.getVideos({ perPage: 100 })
      
      const analyticsData = videos.map(video => {
        const stats = video.stats || { plays: 0, finishes: 0 }
        const finishRate = stats.plays > 0 ? (stats.finishes / stats.plays) * 100 : 0
        
        // Get video ID from URI
        const id = video.uri.split('/').pop() || ''
        
        return {
          id,
          title: video.name,
          views: stats.plays || 0,
          finishes: stats.finishes || 0,
          finishRate,
          watchTime: 0, // Would need additional API calls to get this
        }
      })
      
      setVideos(analyticsData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading video analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  // Sort videos by views (descending)
  const sortedVideos = [...videos].sort((a, b) => b.views - a.views)

  return (
    <div className={className}>
      <h2 className="mb-6 text-2xl font-bold">Video Analytics Dashboard</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-2 text-left">Video Title</th>
              <th className="p-2 text-center">Views</th>
              <th className="p-2 text-center">Completions</th>
              <th className="p-2 text-center">Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {sortedVideos.map((video) => (
              <tr key={video.id} className="border-b hover:bg-muted/20">
                <td className="p-2">{video.title}</td>
                <td className="p-2 text-center">{video.views.toLocaleString()}</td>
                <td className="p-2 text-center">{video.finishes.toLocaleString()}</td>
                <td className="p-2 text-center">{video.finishRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// For backward compatibility with default exports
export default SingleVideoAnalytics
