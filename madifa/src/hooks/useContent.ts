import * as contentService from '@/lib/services/content'
import type { Database } from '@/lib/supabase/database.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

type Content = Database['public']['Tables']['content']['Row']

export function useContent(id?: string) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContent(id!),
    enabled: !!id,
    gcTime: 30 * 60 * 1000, // 30 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => contentService.searchContent(query),
    enabled: !!query,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData
  })
}

export function useFavorites() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const favoritesQuery = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => contentService.getFavorites(user!.id),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  })

  const addMutation = useMutation({
    mutationFn: (contentId: string) =>
      contentService.addToFavorites(user!.id, contentId),
    onMutate: async (contentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] })

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['favorites', user?.id])

      // Optimistically update to the new value
      queryClient.setQueryData(['favorites', user?.id], (old: Content[] = []) => {
        const newContent = queryClient.getQueryData<Content>(['content', contentId])
        return newContent ? [...old, newContent] : old
      })

      return { previousFavorites }
    },
    onSuccess: () => {
      showToast('Added to favorites', 'success')
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['favorites', user?.id], context?.previousFavorites)
      showToast('Failed to add to favorites', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  })

  const removeMutation = useMutation({
    mutationFn: (contentId: string) =>
      contentService.removeFromFavorites(user!.id, contentId),
    onMutate: async (contentId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] })
      const previousFavorites = queryClient.getQueryData(['favorites', user?.id])

      queryClient.setQueryData(['favorites', user?.id], (old: Content[] = []) =>
        old.filter(content => content.id !== contentId)
      )

      return { previousFavorites }
    },
    onSuccess: () => {
      showToast('Removed from favorites', 'success')
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['favorites', user?.id], context?.previousFavorites)
      showToast('Failed to remove from favorites', 'error')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  })

  return {
    favorites: favoritesQuery.data || [],
    isLoading: favoritesQuery.isLoading,
    error: favoritesQuery.error,
    addToFavorites: addMutation.mutate,
    removeFromFavorites: removeMutation.mutate,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending
  }
}