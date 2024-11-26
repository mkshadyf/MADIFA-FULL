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
    enabled: !!query
  })

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.currentTarget.value)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        placeholder="Search content..."
        className="w-full p-4 rounded-lg bg-gray-800 text-white"
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {results.map((result) => (
            <div key={result.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold">{result.title}</h3>
              <p className="text-gray-400">{result.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 