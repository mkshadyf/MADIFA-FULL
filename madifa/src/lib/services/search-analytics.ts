import { createClient } from '@/lib/supabase/client';

interface SearchMetrics {
  totalSearches: number
  averageResults: number
  popularQueries: { query: string; count: number }[]
  searchesByDay: { date: string; count: number }[]
  noResultQueries: { query: string; count: number }[]
  categoryDistribution: { category: string; count: number }[]
}

export async function getSearchMetrics(dateRange: '7d' | '30d' | '90d'): Promise<SearchMetrics> {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(dateRange))

  try {
    // Get total searches and results
    const { data: searches } = await supabase
      .from('search_analytics')
      .select('results_count')
      .gte('created_at', startDate.toISOString())

    const totalSearches = searches?.length || 0
    const averageResults = searches?.reduce((acc, curr) => acc + curr.results_count, 0) / totalSearches || 0

    // Get popular queries
    const { data: popularQueries } = await supabase.rpc('get_popular_queries', {
      start_date: startDate.toISOString(),
      limit_num: 10
    })

    // Get searches by day
    const { data: searchesByDay } = await supabase.rpc('get_daily_searches', {
      start_date: startDate.toISOString()
    })

    // Get queries with no results
    const { data: noResultQueries } = await supabase.rpc('get_no_result_queries', {
      start_date: startDate.toISOString(),
      limit_num: 10
    })

    // Get category distribution
    const { data: categoryDistribution } = await supabase.rpc('get_search_categories', {
      start_date: startDate.toISOString()
    })

    return {
      totalSearches,
      averageResults,
      popularQueries: popularQueries || [],
      searchesByDay: searchesByDay || [],
      noResultQueries: noResultQueries || [],
      categoryDistribution: categoryDistribution || []
    }
  } catch (error) {
    console.error('Error fetching search metrics:', error)
    throw error
  }
}

export async function getSearchSuggestionMetrics() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('search_suggestions_analytics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching suggestion metrics:', error)
    throw error
  }
}

export async function trackSearchSuggestion(
  query: string,
  selectedSuggestion: string | null,
  position?: number
) {
  const supabase = createClient()

  try {
    await supabase
      .from('search_suggestions_analytics')
      .insert({
        query,
        selected_suggestion: selectedSuggestion,
        position,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error tracking search suggestion:', error)
  }
} 
