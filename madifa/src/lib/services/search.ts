import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/types/content'

export interface SearchFilters {
  genres?: string[]
  releaseYear?: number | [number, number] // single year or range
  duration?: number // in minutes
  quality?: '480p' | '720p' | '1080p'
  language?: string
  rating?: number // minimum rating
  sortBy?: 'relevance' | 'date' | 'rating' | 'views'
}

export interface SearchResult {
  content: Content[]
  total: number
  facets: {
    genres: { name: string; count: number }[]
    years: { year: number; count: number }[]
    languages: { language: string; count: number }[]
  }
}

export async function searchContent(
  query: string,
  filters: SearchFilters = {},
  page = 1,
  limit = 20
): Promise<SearchResult> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  try {
    // Build the base query
    let queryBuilder = supabase
      .from('content')
      .select('*, content_tags!inner(*)', { count: 'exact' })
      .textSearch('searchable', query, {
        type: 'websearch',
        config: 'english'
      })

    // Apply filters
    if (filters.genres?.length) {
      queryBuilder = queryBuilder.in('content_tags.name', filters.genres)
    }

    if (filters.releaseYear) {
      if (Array.isArray(filters.releaseYear)) {
        queryBuilder = queryBuilder
          .gte('release_year', filters.releaseYear[0])
          .lte('release_year', filters.releaseYear[1])
      } else {
        queryBuilder = queryBuilder.eq('release_year', filters.releaseYear)
      }
    }

    if (filters.duration) {
      queryBuilder = queryBuilder.lte('duration', filters.duration)
    }

    if (filters.quality) {
      queryBuilder = queryBuilder.contains('available_qualities', [filters.quality])
    }

    if (filters.language) {
      queryBuilder = queryBuilder.eq('language', filters.language)
    }

    if (filters.rating) {
      queryBuilder = queryBuilder.gte('average_rating', filters.rating)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'date':
        queryBuilder = queryBuilder.order('release_date', { ascending: false })
        break
      case 'rating':
        queryBuilder = queryBuilder.order('average_rating', { ascending: false })
        break
      case 'views':
        queryBuilder = queryBuilder.order('view_count', { ascending: false })
        break
      default:
        // Default to relevance (handled by text search)
        break
    }

    // Get paginated results
    const { data: content, count, error } = await queryBuilder
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get facets for filtering
    const facets = await getFacets(query)

    // Track search analytics
    await trackSearchAnalytics(query, filters, content?.length || 0)

    return {
      content: content || [],
      total: count || 0,
      facets
    }
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

async function getFacets(query: string) {
  const supabase = createClient()

  const [genres, years, languages] = await Promise.all([
    // Get genre facets
    supabase.rpc('get_search_genre_facets', { search_query: query }),
    // Get year facets
    supabase.rpc('get_search_year_facets', { search_query: query }),
    // Get language facets
    supabase.rpc('get_search_language_facets', { search_query: query })
  ])

  return {
    genres: genres.data || [],
    years: years.data || [],
    languages: languages.data || []
  }
}

async function trackSearchAnalytics(
  query: string,
  filters: SearchFilters,
  resultCount: number
) {
  const supabase = createClient()

  try {
    await supabase
      .from('search_analytics')
      .insert({
        query,
        filters,
        result_count: resultCount,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error tracking search analytics:', error)
  }
} 
