import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'

interface UseRecommendationsProps {
  userId: string
  limit?: number
}

export function useRecommendations({ userId, limit = 10 }: UseRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get user's watch history
        const { data: history } = await supabase
          .from('viewing_history')
          .select('content_id')
          .eq('user_id', userId)
          .order('last_watched', { ascending: false })
          .limit(5)

        // Get categories from recently watched content
        const recentContentIds = history?.map(h => h.content_id) || []

        if (recentContentIds.length > 0) {
          const { data: recentContent } = await supabase
            .from('content')
            .select('category')
            .in('id', recentContentIds)

          const categories = [...new Set(recentContent?.map(c => c.category))]

          // Get recommendations based on similar categories
          const { data: recommendations, error } = await supabase
            .from('content')
            .select('*')
            .in('category', categories)
            .not('id', 'in', `(${recentContentIds.join(',')})`)
            .order('created_at', { ascending: false })
            .limit(limit)

          if (error) throw error

          setRecommendations(recommendations)
        } else {
          // If no watch history, get newest content
          const { data: newContent, error } = await supabase
            .from('content')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit)

          if (error) throw error

          setRecommendations(newContent)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setError(error instanceof Error ? error.message : 'Failed to load recommendations')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchRecommendations()
    }
  }, [userId, limit])

  return {
    recommendations,
    loading,
    error
  }
} 