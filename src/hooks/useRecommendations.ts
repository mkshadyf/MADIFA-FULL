import { useQuery } from '@tanstack/react-query'

import { contentService } from '@/lib/services/content'

import { useAuth } from './useAuth'

export function useRecommendations(limit = 10) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['recommendations', user?.id, limit],
    queryFn: () => contentService.getRecommendations(user!.id, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  })
}
