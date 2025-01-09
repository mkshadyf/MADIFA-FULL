import { vimeoService } from '@/lib/services/vimeo'
import { createClient } from '@/lib/supabase/client'
import type { VimeoVideo } from '@/types/vimeo'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import type { Content } from '@/types'

const mapVimeoVideoToContent = (video: VimeoVideo): Content => {
  const fileSize = video.files?.[0]?.size || 0
  const categoryName = video.metadata?.connections?.categories?.data?.[0]?.name || 'Uncategorized'

  return {
    id: video.uri.split('/').pop() || '',
    title: video.name,
    description: video.description,
    thumbnail_url: video.pictures?.base_link,
    preview_url: video.pictures?.base_link,
    video_url: video.files?.[0]?.link,
    duration: video.duration,
    category_id: '1', // Default category ID
    created_at: video.created_time,
    updated_at: video.modified_time,
    views: video.stats?.plays || 0,
    rating: null,
    size: fileSize,
    category: categoryName,
    tags: [],
    fileSize: fileSize,
    owner_id: '1', // Default owner ID
    content_type: 'video',
    vimeo_id: video.uri.split('/').pop() || '',
    status: video.status === 'available' ? 'ready' : 'processing',
    type: 'video',
    visibility: video.privacy.view === 'anybody' ? 'public' : 'private',
    release_year: new Date(video.created_time).getFullYear(),
    metadata: {
      width: video.width,
      height: video.height,
      duration: video.duration,
      files: video.files?.map(file => ({
        quality: file.quality,
        type: file.type,
        width: file.width,
        height: file.height,
        link: file.link,
        size: file.size || 0
      })) || []
    }
  }
}

export function useContent() {
  const { data, error, isLoading } = useQuery<Content[]>({
    queryKey: ['content'],
    queryFn: async () => {
      const response = await fetch('/api/content')
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
  })

  return {
    data: data || [],
    error,
    isLoading,
  }
}

export function useSearch(query: string) {
  return useQuery<Content[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      const videos = await vimeoService.getVideos()
      const filteredVideos = videos.filter(
        video =>
          video.name.toLowerCase().includes(query.toLowerCase()) ||
          video.description?.toLowerCase().includes(query.toLowerCase())
      )
      return filteredVideos.map(mapVimeoVideoToContent)
    },
    enabled: !!query,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
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
