 import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useActivityTracking } from '@/hooks/useActivityTracking'
import { useDebounce } from '@/hooks/useDebounce'
import { searchContent } from '@/lib/services/search'
import type { Content } from '@/lib/supabase/types'

import SearchSuggestions from './search-suggestions'

interface SearchFilters {
  category?: string
  year?: number
  rating?: number
  sortBy?: 'relevance' | 'date' | 'rating' | 'views'
}

export default function SearchInterface() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
   const navigate = useNavigate()
  const debouncedQuery = useDebounce(query, 300)
  const { trackSearch } = useActivityTracking()

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery && !filters.category) {
        setResults([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const searchResults = await searchContent(debouncedQuery, filters)
        // Ensure content is not null before setting results
        if (searchResults?.content) {
          // Type assertion to handle the type mismatch between Content types
          setResults(searchResults.content as Content[])
        } else {
          setResults([])
        }

        // Track search activity
        if (debouncedQuery) {
          trackSearch(debouncedQuery)
        }
      } catch (error) {
        console.error('Search error:', error)
        setError(error instanceof Error ? error.message : 'Search failed')
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedQuery, filters])

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="space-y-6">
      {/* Search Input with Suggestions */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search content..."
          className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
          </div>
        ) : null}
        <SearchSuggestions
          query={query}
          onSelect={handleSuggestionSelect}
          visible={showSuggestions}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <select
          title="Category"
          value={filters.category}
          onChange={e =>
            setFilters(prev => ({ ...prev, category: e.target.value }))
          }
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          <option value="movies">Movies</option>
          <option value="series">Series</option>
          <option value="documentaries">Documentaries</option>
        </select>

        {/* Year Filter */}
        <select
          title="Year"
          value={filters.year}
          onChange={e =>
            setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))
          }
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Years</option>
          {Array.from(
            { length: 30 },
            (_, i) => new Date().getFullYear() - i
          ).map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          title="Sort By"
          value={filters.sortBy}
          onChange={e =>
            setFilters(prev => ({
              ...prev,
              sortBy: e.target.value as SearchFilters['sortBy'],
            }))
          }
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="relevance">Most Relevant</option>
          <option value="date">Newest First</option>
          <option value="rating">Highest Rated</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>

      {/* Results */}
      {error ? (
        <div className="py-4 text-center text-red-500">{error}</div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map(content => (
            <div
              key={content.id}
              onClick={() => navigate(`/watch/${content.id}`)}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-800"
            >
              {content.thumbnail_url ? (
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-medium text-white">{content.title}</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    {content.release_year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        query &&
        !loading && (
          <div className="py-8 text-center text-gray-400">No results found</div>
        )
      )}
    </div>
  )
}
