import { getRecommendations } from '@/lib/services/recommendations'
import type { Content } from '@/types/content'
import { useQuery } from '@tanstack/react-query'
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
        const recommendations = contentId
          ? await getRecommendations(contentId, limit)
          : await getRecommendations(user.id, limit)

        return recommendations.map(item => ({
          ...item,
          category_id: item.category_id || '',
          category: item.category || '',
          fileSize: item.size || 0,
          type: item.content_type,
          owner_id: item.owner_id || '',
        })) as Content[]
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
