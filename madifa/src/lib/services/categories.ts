import { createClient } from '@/lib/supabase/client'

export async function getCategories() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        content_count:content(count),
        total_views:content_stats(sum(views))
      `)
      .order('order', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export async function getCategoryContent(slug: string, limit = 20) {
  const supabase = createClient()

  try {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!category) throw new Error('Category not found')

    const { data: content, error } = await supabase
      .from('content')
      .select(`
        *,
        content_stats (
          views,
          average_rating
        )
      `)
      .eq('category', category.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return content || []
  } catch (error) {
    console.error('Error fetching category content:', error)
    throw error
  }
}

export async function getFeaturedCategories(limit = 5) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        content_count:content(count),
        total_views:content_stats(sum(views))
      `)
      .eq('is_featured', true)
      .order('order', { ascending: true })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching featured categories:', error)
    throw error
  }
} 
