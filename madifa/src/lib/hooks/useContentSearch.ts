import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'

interface UseContentSearchProps {
  initialQuery?: string
  category?: string
  limit?: number
}

export function useContentSearch({
  initialQuery = '',
  category,
  limit = 20
}: UseContentSearchProps = {}) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const searchContent = async () => {
      setLoading(true)
      setError(null)

      try {
        let queryBuilder = supabase
          .from('content')
          .select('*')
          .limit(limit)

        if (query) {
          queryBuilder = queryBuilder
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        }

        if (category) {
          queryBuilder = queryBuilder.eq('category', category)
        }

        const { data, error: searchError } = await queryBuilder

        if (searchError) throw searchError

        setResults(data || [])
      } catch (error) {
        console.error('Search error:', error)
        setError(error instanceof Error ? error.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(searchContent, 300)
    return () => clearTimeout(timer)
  }, [query, category, limit])

  return {
    query,
    setQuery,
    results,
    loading,
    error
  }
} 
