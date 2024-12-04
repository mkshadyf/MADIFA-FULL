import React from 'react'
import { useParams } from 'react-router-dom'
import VimeoPlayer from '@/components/video/VimeoPlayer'
import LoadingState from '@/components/ui/loading-state'
import { useAuth } from '@/hooks/useAuth'
import { useFavorites } from '@/hooks/useContent'
import type { Database } from '@/lib/supabase/database.types'
import { useVimeoContent } from '@/hooks/useVimeoContent'

type Content = Database['public']['Tables']['content']['Row']

export default function WatchPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { video, isLoading, error } = useVimeoContent(id)
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites()
  const isFavorited = favorites.some((fav: Content) => fav.id === id)

  const formatDuration = (duration?: number) => {
    if (!duration) return '0:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleFavoriteClick = async () => {
    if (!video || !profile) return

    try {
      if (isFavorited) {
        await removeFromFavorites(id!)
      } else {
        await addToFavorites({
          id: id!,
          title: video.name,
          description: video.description,
          thumbnail_url: video.pictures.sizes[0].link,
          video_url: video.files[0].link,
          category: video.categories[0]?.name || 'uncategorized',
          release_year: new Date().getFullYear(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        
        })
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <VimeoPlayer
          videoId={id!}
          title={video?.name}
          className="mb-6"
        />

        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {video?.name}
              </h1>
              <p className="text-gray-400">
                {video?.description}
              </p>
            </div>

            <button
              onClick={handleFavoriteClick}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                isFavorited
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{isFavorited ? 'Remove from favorites' : 'Add to favorites'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
            <div>
              <span className="font-medium">Duration:</span>{' '}
              {formatDuration(video?.duration)}
            </div>
            <div>
              <span className="font-medium">Quality:</span>{' '}
              {video?.files[0]?.quality || 'Auto'}
            </div>
            <div>
              <span className="font-medium">Categories:</span>{' '}
              {video?.categories.map(c => c.name).join(', ')}
            </div>
            <div>
              <span className="font-medium">Views:</span>{' '}
              {video?.metadata.connections.likes.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 