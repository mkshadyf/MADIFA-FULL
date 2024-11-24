import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/types/content'

export async function getRecommendations(
  userId: string,
  limit = 10
): Promise<Content[]> {
  const supabase = createClient()

  try {
    // Get user's watch history
    const { data: history } = await supabase
      .from('watch_history')
      .select(`
        content_id,
        content:content_id (
          id,
          title,
          description,
          category,
          tags
        )
      `)
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(20)

    // Extract categories from watch history
    const watchedCategories = history
      ?.map((item: { content: { category: string } }) => item.content?.category)
      .filter(Boolean) || []

    // Get content IDs to exclude
    const excludeIds = history?.map((item: { content_id: string }) => item.content_id) || []

    // Get recommendations based on watched categories
    const { data: recommendations } = await supabase
      .from('content')
      .select(`
        *,
        content_stats (
          average_rating
        )
      `)
      .in('category', watchedCategories)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('content_stats(average_rating)', { ascending: false })
      .limit(limit)

    return recommendations || []
  } catch (error) {
    console.error('Error getting recommendations:', error)
    throw error
  }
} 