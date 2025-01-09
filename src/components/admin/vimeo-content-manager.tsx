import { VideoCard } from '@/components/admin/Content/VideoCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/hooks/useToast'
import { vimeoService } from '@/lib/services/vimeo'
import type { VimeoVideo } from '@/types/vimeo'
import { useState } from 'react'

export default function VimeoContentManager() {
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const loadVideos = async () => {
    try {
      setLoading(true)
      const vimeoVideos = await vimeoService.getVideos()
      setVideos(vimeoVideos)
    } catch (error) {
      console.error('Failed to load videos:', error)
      showToast('Failed to load videos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (videoId: string) => {
    try {
      await vimeoService.deleteVideo(videoId)
      setVideos(videos.filter(video => video.uri.split('/').pop() !== videoId))
      showToast('Video deleted successfully', 'success')
    } catch (error) {
      console.error('Failed to delete video:', error)
      showToast('Failed to delete video', 'error')
    }
  }

  const handleSecurityUpdate = async (videoId: string, updates: any) => {
    try {
      await vimeoService.updateVideoSecurity(videoId, updates)
      showToast('Security settings updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update security settings:', error)
      showToast('Failed to update security settings', 'error')
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vimeo Content</h2>
          <p className="text-gray-500">Manage your Vimeo videos</p>
        </div>
        <Button
          onClick={loadVideos}
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? <LoadingSpinner /> : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map(video => (
          <VideoCard
            key={video.uri}
            video={video}
            onDelete={handleDelete}
            onSecurityUpdate={handleSecurityUpdate}
            onThumbnailUpdate={async () => {}}
          />
        ))}
      </div>

      {videos.length === 0 && !loading && (
        <p className="text-center text-gray-500">No videos found</p>
      )}
    </Card>
  )
}
