import * as contentService from '@/lib/services/content'
import { useAuth } from '@/providers/AuthProvider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useContent(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.getContent(id)
  })
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => contentService.searchContent(query),
    enabled: !!query
  })
}

export function useFavorites() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: () => contentService.getFavorites(user!.id),
    enabled: !!user
  })

  const addMutation = useMutation({
    mutationFn: (contentId: string) =>
      contentService.addToFavorites(user!.id, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  })

  const removeMutation = useMutation({
    mutationFn: (contentId: string) =>
      contentService.removeFromFavorites(user!.id, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
    }
  })

  return {
    ...query,
    addToFavorites: addMutation.mutate,
    removeFromFavorites: removeMutation.mutate
  }
} 