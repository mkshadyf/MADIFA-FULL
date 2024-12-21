import { vimeoService } from '@/lib/services/vimeo'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'
import type { VimeoVideo } from '@/types/vimeo'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

const mapVimeoVideoToContent = (video: VimeoVideo): Content => ({
  id: video.uri.split('/').pop() || '',
  title: video.name,
  description: video.description,
  thumbnail_url: video.pictures?.base_link || null,
  duration: video.duration,
  size: video.size,
  category: video.categories?.[0]?.name || '',
  release_year: new Date(video.created_time).getFullYear(),
  status: video.status === 'available' ? 'ready' : 'processing',
  created_at: video.created_time,
  updated_at: video.modified_time,
  error: video.status === 'error' ? video.error_message : undefined,
})

export function useContent(id?: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      if (!id) {
        // Get all videos if no ID is provided
        const videos = await vimeoService.getVideos()
        return videos.map(mapVimeoVideoToContent)
      }

      // Get single video if ID is provided
      const video = await vimeoService.getVideoDetails(id)
      return mapVimeoVideoToContent(video)
    },
    enabled: true,
    gcTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const videos = await vimeoService.getVideos({ query })
      return videos.map(mapVimeoVideoToContent)
    },
    enabled: !!query,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: previousData => previousData,
  })
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { profile } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      fetchFavorites()
    }
  }, [profile])

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('video_id')
        .eq('user_id', profile?.id)

      if (error) throw error

      // Fetch video details from Vimeo for each favorite
      const favoriteVideos = await Promise.all(
        (data || []).map(async fav => {
          const video = await vimeoService.getVideoDetails(fav.video_id)
          return mapVimeoVideoToContent(video)
        })
      )

      setFavorites(favoriteVideos)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch favorites')
      )
    } finally {
      setIsLoading(false)
    }
  }

  const addToFavorites = async (content: Content) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ video_id: content.id, user_id: profile?.id }])

      if (error) throw error
      setFavorites([...favorites, content])
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to add to favorites')
      )
      throw err
    }
  }

  const removeFromFavorites = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('video_id', contentId)
        .eq('user_id', profile?.id)

      if (error) throw error
      setFavorites(favorites.filter(fav => fav.id !== contentId))
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to remove from favorites')
      )
      throw err
    }
  }

  return {
    favorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
  }
}
