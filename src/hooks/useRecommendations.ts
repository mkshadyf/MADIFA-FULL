import { useQuery } from '@tanstack/react-query'

import { getRecommendations } from '@/lib/services/recommendations'
import type { Content } from '@/lib/supabase/types'
import { useAuth } from './useAuth'

interface UseRecommendationsProps {
  contentId?: string
  limit?: number
  excludeIds?: string[]
}

export function useRecommendations({
  contentId,
  limit = 10,
  excludeIds = [],
}: UseRecommendationsProps = {}) {
  const { user } = useAuth()

  return useQuery<Content[]>({
    queryKey: ['recommendations', user?.id, contentId, limit, excludeIds],
    queryFn: async () => {
      if (!user) return []

      try {
        if (contentId) {
          // Get similar content if viewing specific content
          return await getRecommendations(contentId, limit)
        } else {
          // Get personalized recommendations
          return await getRecommendations(user.id, limit)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        throw error
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  })
}
