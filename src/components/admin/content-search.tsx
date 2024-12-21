import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type Content = Database['public']['Tables']['content']['Row'] & {
  category: string
  release_year: number
}
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
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          title="Category"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white"
        >
          <option value="all">All Categories</option>
          <option value="movies">Movies</option>
          <option value="series">Series</option>
          <option value="documentaries">Documentaries</option>
        </select>
      </div>

      {loading ? (
        <div className="py-4 text-center text-gray-400">Searching...</div>
      ) : null}

      {results.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-gray-800">
          <div className="divide-y divide-gray-700">
            {results.map(content => (
              <div
                key={content.id}
                className="hover:bg-gray-750 cursor-pointer p-4"
                onClick={() => onSelect?.(content)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={content.thumbnail_url || ''}
                      alt={content.title}
                      className="h-16 w-24 rounded object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{content.title}</h3>
                    <p className="text-sm text-gray-400">
                      {content.category} • {content.release_year}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {content.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && !loading && results.length === 0 ? (
        <div className="py-4 text-center text-gray-400">No results found</div>
      ) : null}
    </div>
  )
}
