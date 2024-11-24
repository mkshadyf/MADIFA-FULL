'use client'

import { useState, useEffect } from 'react'
import { getVideosFromFolder, updateVideoPrivacy } from '@/lib/services/vimeo'
import type { VimeoVideo } from '@/types/vimeo'

interface VimeoContentManagerProps {
  onVideoSelect?: (video: VimeoVideo) => void
  folderId?: string
}

export default function VimeoContentManager({ onVideoSelect, folderId = 'default' }: VimeoContentManagerProps) {
  const [videos, setVideos] = useState<VimeoVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVideos()
  }, [folderId])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const fetchedVideos = await getVideosFromFolder(folderId)
      setVideos(fetchedVideos)
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVideoPrivacy = async (videoId: string, makePublic: boolean) => {
    try {
      await updateVideoPrivacy(videoId, makePublic)
      await loadVideos() // Refresh the list
    } catch (error) {
      console.error('Error updating video privacy:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div
          key={video.uri}
          className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
        >
          <div 
            className="relative aspect-video cursor-pointer"
            onClick={() => onVideoSelect?.(video)}
          >
            <img
              src={video.pictures.sizes[3].link}
              alt={video.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity" />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{video.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{video.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Status: {video.privacy.view}
              </span>
              <button
                onClick={() => toggleVideoPrivacy(
                  video.uri.split('/').pop()!,
                  video.privacy.view === 'disable'
                )}
                className={`px-3 py-1 rounded-full text-sm ${
                  video.privacy.view === 'disable'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {video.privacy.view === 'disable' ? 'Make Public' : 'Make Private'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 