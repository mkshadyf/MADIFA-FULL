import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import { useCallback, useEffect, useState } from 'react'

type Content = Database['public']['Tables']['content']['Row']

interface SearchFilters {
  category?: string
  language?: string
  year?: string
  duration?: string
  rating?: string
}

export function useContentSearch(initialQuery = '', initialFilters: SearchFilters = {}) {
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState(initialFilters)
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const search = useCallback(async () => {
    if (query.length < 2 && Object.keys(filters).length === 0) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      let queryBuilder = supabase
        .from('content')
        .select('*')

      // Apply text search if query exists
      if (query.length >= 2) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        )
      }

      // Apply filters
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category)
      }
      if (filters.language) {
        queryBuilder = queryBuilder.eq('language', filters.language)
      }
      if (filters.year) {
        queryBuilder = queryBuilder.eq('release_year', filters.year)
      }
      if (filters.rating) {
        queryBuilder = queryBuilder.eq('age_rating', filters.rating)
      }
      if (filters.duration) {
        // Convert duration filter to minutes range
        const [min, max] = getDurationRange(filters.duration)
        queryBuilder = queryBuilder
          .gte('duration', min)
          .lte('duration', max)
      }

      const { data, error } = await queryBuilder.limit(50)

      if (error) throw error
      setResults(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, filters])

  useEffect(() => {
    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [search])

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    error,
  }
}

function getDurationRange(duration: string): [number, number] {
  switch (duration) {
    case '< 30 min':
      return [0, 30]
    case '30-60 min':
      return [30, 60]
    case '1-2 hrs':
      return [60, 120]
    case '> 2 hrs':
      return [120, 999]
    default:
      return [0, 999]
  }
} 