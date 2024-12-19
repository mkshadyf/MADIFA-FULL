import React from 'react'
import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  title: string
  description: string
  thumbnail_url: string
}

export default function SearchPage() {
  const [query, setQuery] = React.useState('')
  const supabase = createClient()

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return []

      const { data } = await supabase
        .from('content')
        .select('*')
        .ilike('title', `%${query}%`)
        .limit(20)

      return data || []
    },
    enabled: !!query,
  })

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder="Search content..."
        className="w-full rounded-lg bg-gray-800 p-4 text-white"
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map(result => (
            <div key={result.id} className="rounded-lg bg-gray-800 p-4">
              <h3 className="font-bold text-white">{result.title}</h3>
              <p className="text-gray-400">{result.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
