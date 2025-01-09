import { useDebounce } from '@/hooks/useDebounce'
import { searchContent } from '@/lib/services/search'
import { trackSearchSuggestion } from '@/lib/services/search-analytics'
import { useEffect, useRef, useState } from 'react'

interface SearchSuggestionsProps {
  query: string
  onSelect: (suggestion: string) => void
  visible: boolean
  onClose?: () => void
  mode?: 'basic' | 'content'
}

interface SearchResult {
  title: string
  type?: string
}

export default function SearchSuggestions({
  query,
  onSelect,
  visible,
  onClose,
  mode = 'basic',
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
        const results = await searchContent(debouncedQuery)
        if (Array.isArray(results)) {
          setSuggestions(
            mode === 'basic'
              ? results.map((result: SearchResult) => result.title)
              : results.map((result: SearchResult) =>
                  result.type
                    ? `${result.title} (${result.type})`
                    : result.title
                )
          )
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
  }, [debouncedQuery, mode])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        onClose?.()
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible, onClose])

  const handleSuggestionClick = async (suggestion: string, index: number) => {
    await trackSearchSuggestion(debouncedQuery, suggestion, index)
    onSelect(suggestion)
    onClose?.()
  }

  if (!visible || !suggestions.length) return null

  return (
    <div
      ref={suggestionsRef}
      className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md bg-white shadow-lg"
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      ) : (
        <ul className="py-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => handleSuggestionClick(suggestion, index)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
