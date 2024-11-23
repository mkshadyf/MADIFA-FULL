'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import ContentCard from '@/components/ui/content-card'
import Navbar from '@/components/ui/navbar'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth()
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
        console.error('Error searching content:', error)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  if (authLoading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <input
              type="search"
              placeholder="Search movies, series, music..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((content) => (
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