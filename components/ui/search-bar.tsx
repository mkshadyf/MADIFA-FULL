'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/hooks/useDebounce'
import SearchSuggestionsList from './search-suggestions-list'
import { useActivityTracking } from '@/lib/hooks/useActivityTracking'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const router = useRouter()
  const { trackSearch } = useActivityTracking()
  const debouncedQuery = useDebounce(query, 300)

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    trackSearch(searchQuery)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setShowSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion)
    handleSearch(suggestion)
  }

  return (
    <div className="relative max-w-xl w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search content..."
          className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <SearchSuggestionsList
        query={debouncedQuery}
        onSelect={handleSuggestionSelect}
        visible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
      />
    </div>
  )
} 