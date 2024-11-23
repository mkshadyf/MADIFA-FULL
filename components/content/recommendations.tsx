'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ContentCard from '@/components/ui/content-card'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface RecommendationsProps {
  userId: string
  currentContentId?: string
  category?: string
  limit?: number
}

export default function Recommendations({ 
  userId, 
  currentContentId,
  category,
  limit = 5 
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get user's viewing history
        const { data: history } = await supabase
          .from('viewing_history')
          .select('content_id')
          .eq('user_id', userId)
          .order('last_watched', { ascending: false })
          .limit(10)

        const watchedIds = history?.map(h => h.content_id) || []

        // Get recommendations based on viewing history
        let query = supabase
          .from('content')
          .select('*')
          .not('id', 'in', `(${watchedIds.join(',')})`)
          .limit(limit)

        if (currentContentId) {
          query = query.neq('id', currentContentId)
        }

        if (category) {
          query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) throw error
        setRecommendations(data)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [userId, currentContentId, category, limit])

  if (loading) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {recommendations.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          aspectRatio="video"
        />
      ))}
    </div>
  )
} 