import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'
import ContentCard from '@/components/ui/content-card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import Navbar from '@/components/ui/navbar'
import { logger } from '@/lib/logger'

type Content = Database['public']['Tables']['content']['Row']

export default function SearchPage() {
  const { loading: authLoading } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Content[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20)

        if (error) throw error
        setResults(data || [])
      } catch (error) {
          logger.error('Error searching content:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  if (authLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <input
              type="search"
              placeholder="Search movies, series, music..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map(content => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center text-gray-400">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
