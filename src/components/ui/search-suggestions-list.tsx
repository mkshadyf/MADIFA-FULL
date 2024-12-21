import { useState, useEffect, useRef } from 'react'

import { useDebounce } from '@/hooks/useDebounce'
import { trackSearchSuggestion } from '@/lib/services/search-analytics'
import { searchContent } from '@/lib/services/search'
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
  onClose,
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
        const results = await searchContent(debouncedQuery)
        if (Array.isArray(results)) {
          setSuggestions(results.map((result: { title: string }) => result.title))
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
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
      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-gray-700 bg-gray-800 shadow-lg"
    >
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-400">
          Loading suggestions...
        </div>
      ) : (
        <ul className="divide-y divide-gray-700">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion, index)}
              className="cursor-pointer px-4 py-3 transition-colors hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="h-4 w-4 text-gray-400"
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
