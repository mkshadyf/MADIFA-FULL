import { useAuth } from '@/components/providers/AuthProvider'
import { getRecommendations, getSimilarContent } from '@/lib/services/recommendations'
import type { Content } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'

interface UseRecommendationsProps {
  userId?: string
  contentId?: string
  limit?: number
  excludeIds?: string[]
}

export function useRecommendations({
  userId,
  contentId,
  limit = 10,
  excludeIds = []
}: UseRecommendationsProps = {}) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return

      try {
        let recommendedContent: Content[]

        if (contentId) {
          // Get similar content if viewing specific content
          recommendedContent = await getSimilarContent(contentId, limit)
        } else {
          // Get personalized recommendations
          recommendedContent = await getRecommendations({
            userId: user.id,
            limit,
            excludeIds
          })
        }

        setRecommendations(recommendedContent)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setError(error instanceof Error ? error.message : 'Failed to load recommendations')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user, contentId, limit, excludeIds])

  return {
    recommendations,
    loading,
    error
  }
} 
