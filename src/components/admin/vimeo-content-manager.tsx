import { useEffect, useState } from 'react'

import type { VimeoVideo, VimeoPrivacy } from '@/types/vimeo'
import { getVideosFromFolder, updateVideoPrivacy } from '@/lib/services/vimeo'

interface Props {
  onVideoSelect?: (video: VimeoVideo) => void
  folderId?: string
  onSuccess?: () => void
}

export default function VimeoContentManager({
  onVideoSelect,
  folderId = 'default',
  onSuccess,
}: Props) {
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadVideos()
  }, [folderId])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const fetchedVideos = await getVideosFromFolder(folderId)
      setVideos(fetchedVideos as VimeoVideo[])
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVideoPrivacy = async (videoId: string, makePublic: boolean) => {
    try {
      const privacy: VimeoPrivacy = {
        view: makePublic ? 'anybody' : 'nobody',
        embed: makePublic ? 'public' : 'private',
        comments: 'anybody',
        download: false
      }
      await updateVideoPrivacy(videoId, privacy)
      await loadVideos() // Refresh the list
      onSuccess?.()
    } catch (error) {
      console.error('Error updating video privacy:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {}
      {videos.map(video => (
        <div
          key={video.uri}
          className="overflow-hidden rounded-lg bg-gray-800 shadow-lg"
        >
          <div
            className="relative aspect-video cursor-pointer"
            onClick={() => onVideoSelect?.(video)}
            role="button"
            tabIndex={0}
            onKeyPress={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                onVideoSelect?.(video)
              }
            }}
          >
            <img
              src={video.pictures?.sizes[3]?.link || ''}
              alt={video.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity hover:bg-opacity-20" />
          </div>
          <div className="p-4">
            <h3 className="mb-2 text-lg font-semibold text-white">
              {video.name}
            </h3>
            <p className="mb-4 text-sm text-gray-400">{video.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Status: {video.privacy.view}
              </span>
              <button
                onClick={() =>
                  void toggleVideoPrivacy(
                    video.uri.split('/').pop()!,
                    video.privacy.view === 'disable'
                  )
                }
                className={`rounded-full px-3 py-1 text-sm ${
                  video.privacy.view === 'disable'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {video.privacy.view === 'disable'
                  ? 'Make Public'
                  : 'Make Private'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
