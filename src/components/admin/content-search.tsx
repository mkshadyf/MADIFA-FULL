import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase/client'
import { debounce } from '@/lib/utils/debounce'
import type { Content } from '@/types/content'
import React, { useCallback, useState } from 'react'

interface SearchState {
  query: string
  results: Content[]
  loading: boolean
  error: string | null
}

export const ContentSearch: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
    error: null,
  })

  const searchContent = async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], loading: false }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      setState(prev => ({
        ...prev,
        results: data || [],
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        loading: false,
      }))
    }
  }

  const debouncedSearch = useCallback(
    debounce((query: string) => searchContent(query), 300),
    []
  )

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value
    setState(prev => ({ ...prev, query }))
    debouncedSearch(query)
  }

  const formatRating = (rating: number | null): string => {
    if (rating === null) return 'N/A'
    return rating.toFixed(1)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search content..."
          value={state.query}
          onChange={handleInputChange}
          className="flex-1"
        />
        <Button
          onClick={() => searchContent(state.query)}
          disabled={state.loading || !state.query.trim()}
        >
          Search
        </Button>
      </div>

      {state.loading && (
        <div className="flex justify-center p-4">
          <LoadingSpinner />
        </div>
      )}

      {state.error && (
        <Alert variant="destructive">
          <p>{state.error}</p>
        </Alert>
      )}

      {state.results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {state.results.map(content => (
            <div
              key={content.id}
              className="rounded-lg border p-4 transition-shadow hover:shadow-md"
            >
              <h3 className="font-semibold">{content.title}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {content.description}
              </p>
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>Views: {content.views}</span>
                <span>Rating: {formatRating(content.rating)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !state.loading &&
        state.query && (
          <p className="text-center text-gray-500">No results found</p>
        )
      )}
    </div>
  )
}
