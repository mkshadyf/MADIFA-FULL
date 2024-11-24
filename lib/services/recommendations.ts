import { createClient } from '@/lib/supabase/client'

interface GetRecommendationsParams {
  userId: string
  limit?: number
  excludeIds?: string[]
}

export async function getRecommendations({
  userId,
  limit = 10,
  excludeIds = []
}: GetRecommendationsParams) {
  const supabase = createClient()

  try {
    // Get user's watch history
    const { data: history } = await supabase
      .from('viewing_history')
      .select('content_id, content(category)')
      .eq('user_id', userId)
      .order('last_watched', { ascending: false })
      .limit(5)

    // Extract categories from watch history
    const watchedCategories = history
      ?.map(item => item.content?.category)
      .filter(Boolean) || []

    // Get recommendations based on watched categories
    if (watchedCategories.length > 0) {
      const { data: recommendations } = await supabase
        .from('content')
        .select(`
          *,
          content_stats (
            views,
            average_rating
          )
        `)
        .in('category', watchedCategories)
        .not('id', 'in', `(${excludeIds.concat(history?.map(h => h.content_id) || []).join(',')})`)
        .order('content_stats(average_rating)', { ascending: false })
        .limit(limit)

      return recommendations || []
    }

    // If no watch history, return popular content
    const { data: popular } = await supabase
      .from('content')
      .select(`
        *,
        content_stats (
          views,
          average_rating
        )
      `)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('content_stats(views)', { ascending: false })
      .limit(limit)

    return popular || []
  } catch (error) {
    console.error('Error getting recommendations:', error)
    throw error
  }
}

export async function getSimilarContent(contentId: string, limit = 10) {
  const supabase = createClient()

  try {
    // Get content details
    const { data: content } = await supabase
      .from('content')
      .select('category')
      .eq('id', contentId)
      .single()

    if (!content) throw new Error('Content not found')

    // Get similar content in same category
    const { data: similar } = await supabase
      .from('content')
      .select(`
        *,
        content_stats (
          views,
          average_rating
        )
      `)
      .eq('category', content.category)
      .neq('id', contentId)
      .order('content_stats(average_rating)', { ascending: false })
      .limit(limit)

    return similar || []
  } catch (error) {
    console.error('Error getting similar content:', error)
    throw error
  }
} 