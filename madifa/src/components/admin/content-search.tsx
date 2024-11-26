

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface ContentSearchProps {
  onSelect?: (content: Content) => void
}

export default function ContentSearch({ onSelect }: ContentSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchContent()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, selectedCategory])

  const searchContent = async () => {
    setLoading(true)
    try {
      let queryBuilder = supabase
        .from('content')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10)

      if (selectedCategory !== 'all') {
        queryBuilder = queryBuilder.eq('category', selectedCategory)
      }

      const { data, error } = await queryBuilder

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Error searching content:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        >
          <option value="all">All Categories</option>
          <option value="movies">Movies</option>
          <option value="series">Series</option>
          <option value="documentaries">Documentaries</option>
        </select>
      </div>

      {loading && (
        <div className="text-center text-gray-400 py-4">
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-700">
            {results.map((content) => (
              <div
                key={content.id}
                className="p-4 hover:bg-gray-750 cursor-pointer"
                onClick={() => onSelect?.(content)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="h-16 w-24 object-cover rounded"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{content.title}</h3>
                    <p className="text-sm text-gray-400">
                      {content.category} • {content.release_year}
                    </p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {content.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          No results found
        </div>
      )}
    </div>
  )
} 
