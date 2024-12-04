import { useCallback, useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((query: string): boolean => {
    // Check if window is defined (browser environment)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  }, [])

  const [matches, setMatches] = useState<boolean>(getMatches(query))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)

    // Initial check
    setMatches(mediaQuery.matches)

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener using modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback cleanup for older browsers
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [query, getMatches])

  return matches
} 