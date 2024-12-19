import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/lib/hooks/useDebounce'
import { getSearchSuggestions } from '@/lib/services/search'

interface SearchSuggestionsProps {
  query: string
  onSelect: (suggestion: string) => void
  visible: boolean
}

export default function SearchSuggestions({
  query,
  onSelect,
  visible,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const suggestionsRef = useRef<HTMLDivElement>(null)

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
        logger.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        onSelect('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onSelect])

  if (!visible || !suggestions.length) return null

  return (
    <div
      ref={suggestionsRef}
      className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-gray-700 bg-gray-800 shadow-lg"
    >
      {loading ? (
        <div className="p-2 text-sm text-gray-400">Loading suggestions...</div>
      ) : (
        <ul className="py-1">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => onSelect(suggestion)}
              className="cursor-pointer px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
