import { createClient } from '@/lib/supabase/client'

export interface DbContent {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  preview_url: string | null
  duration: number | null
  category_id: string
  category: string
  file_size: number
  content_type: 'video' | 'audio' | 'document' | 'image'
  created_at: string
  updated_at: string
  views: number
  rating: number | null
  tags: string[]
  user_id: string
  status: 'draft' | 'published' | 'archived' | 'processing' | 'ready' | 'inactive'
  visibility: 'public' | 'private' | 'unlisted'
  monetization: {
    type: 'free' | 'premium' | 'pay_per_view'
    price?: number
    currency?: string
  }
}

export interface ContentMetrics {
  totalContent: number
  activeContent: number
  totalViews: number
  averageRating: number
  storageUsed: number
  categoryDistribution: Record<string, number>
  popularContent: DbContent[]
}

export async function fetchMetrics(): Promise<ContentMetrics> {
  const supabase = createClient()

  try {
    // Get total content
    const { count: totalContent } = await supabase
      .from('content')
      .select('*', { count: 'exact' })

    // Get active content
    const { count: activeContent } = await supabase
      .from('content')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    // Get total views
    const { count: totalViews } = await supabase
      .from('viewing_history')
      .select('*', { count: 'exact' })

    // Get category distribution
    const { data: categories = [] } = await supabase
      .from('content')
      .select('category')

    const categoryDistribution = categories?.reduce(
      (acc, item) => {
        const category = item.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Get average rating
    const { data: ratings = [] } = await supabase
      .from('content')
      .select('rating')
      .not('rating', 'is', null)

    const validRatings = ratings?.filter(item => item.rating !== null)
    const averageRating = validRatings?.length
      ? validRatings.reduce((sum, item) => sum + (item.rating || 0), 0) /
      validRatings.length
      : 0

    // Get storage used
    const { data: storage = [] } = await supabase
      .from('content')
      .select('file_size')

    const storageUsed =
      storage!.reduce((sum, item) => sum + (item.file_size || 0), 0) /
      (1024 * 1024 * 1024)

    // Get popular content
    const { data: popularContent = [] } = await supabase
      .from('content')
      .select('*')
      .order('views', { ascending: false })
      .limit(10)

    return {
      totalContent: totalContent || 0,
      activeContent: activeContent || 0,
      totalViews: totalViews || 0,
      averageRating,
      storageUsed,
      categoryDistribution: categoryDistribution || {},
      popularContent: popularContent as DbContent[]
    }
  } catch (error) {
    console.error('Error fetching content metrics:', error)
    throw error
  }
} 