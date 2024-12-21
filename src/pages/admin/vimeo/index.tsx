 import { useEffect, useState } from 'react'

import type { VimeoVideo } from '@/types/vimeo'
import { vimeoService } from '@/lib/services/vimeo'
import { toast } from '@/components/ui/toast'
import { BatchUploader } from '@/components/admin/BatchUploader'
import { VideoCard } from '@/components/admin/VideoCard'
 
export default function VimeoManagement() {
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const response = await vimeoService.getVideos()
      setVideos(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to fetch videos:', error)
      toast.error('Failed to fetch videos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const handleDelete = async (videoId: string) => {
    try {
      await vimeoService.deleteVideo(videoId)
      toast.success('Video deleted successfully')
      fetchVideos()
    } catch (error) {
      console.error('Failed to delete video:', error)
      toast.error('Failed to delete video')
    }
  }

  const handleSecurityUpdate = async (videoId: string, security: any) => {
    try {
      await vimeoService.updateVideoPrivacy(videoId, security)
      toast.success('Security settings updated')
      fetchVideos()
    } catch (error) {
      console.error('Failed to update security settings:', error)
      toast.error('Failed to update security settings')
    }
  }

  const handleUpdateThumbnail = async (
    video: VimeoVideo,
    thumbnailUrl: string
  ) => {
    try {
      await vimeoService.updateVideoMetadata(video.uri.split('/').pop()!, {
        pictures: {
          active: true,
          uri: thumbnailUrl,
        },
      })
      toast.success('Thumbnail updated successfully')
      fetchVideos()
    } catch (error) {
      console.error('Failed to update thumbnail:', error)
      toast.error('Failed to update thumbnail')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Video Management</h1>
        <BatchUploader onComplete={fetchVideos} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map(video => (
          <VideoCard
            key={video.uri}
            video={video}
            onDelete={() => handleDelete(video.uri.split('/').pop()!)}
            onSecurityUpdate={security =>
              handleSecurityUpdate(video.uri.split('/').pop()!, security)
            }
            onThumbnailUpdate={url => handleUpdateThumbnail(video, url)}
          />
        ))}
      </div>
    </div>
  )
}
