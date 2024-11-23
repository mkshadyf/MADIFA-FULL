'use client'

import { useContentSearch } from '@/lib/hooks/useContentSearch'
import type { Content } from '@/lib/supabase/types'

interface SearchInterfaceProps {
  onSelect?: (content: Content) => void
}

export default function SearchInterface({ onSelect }: SearchInterfaceProps) {
  const {
    query,
    setQuery,
    results,
    loading,
    error
  } = useContentSearch()

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search content..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((content) => (
            <div
              key={content.id}
              onClick={() => onSelect?.(content)}
              className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
            >
              {content.thumbnail_url && (
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/60 to-transparent">
                <div>
                  <h3 className="text-sm font-medium text-white">{content.title}</h3>
                  <p className="text-xs text-gray-300">{content.release_year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No results found
        </div>
      )}
    </div>
  )
} 