'use client'

import { useEffect, useRef } from 'react'
import { getSearchSuggestions } from '@/lib/services/search'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { trackSearchSuggestion } from '@/lib/services/search-analytics'

interface SearchSuggestionsListProps {
  query: string
  onSelect: (suggestion: string) => void
  visible: boolean
  onClose: () => void
}

export default function SearchSuggestionsList({
  query,
  onSelect,
  visible,
  onClose
}: SearchSuggestionsListProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const results = await getSearchSuggestions(debouncedQuery)
        setSuggestions(results)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSuggestionClick = async (suggestion: string, index: number) => {
    // Track suggestion selection
    await trackSearchSuggestion(query, suggestion, index)
    onSelect(suggestion)
  }

  if (!visible || !suggestions.length) return null

  return (
    <div
      ref={listRef}
      className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 overflow-hidden"
    >
      {loading ? (
        <div className="p-4 text-gray-400 text-sm text-center">
          Loading suggestions...
        </div>
      ) : (
        <ul className="divide-y divide-gray-700">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion, index)}
              className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <span className="text-sm text-gray-300">{suggestion}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 