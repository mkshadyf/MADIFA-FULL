import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import type { Content } from '@/lib/database.types'
import { contentService } from '@/lib/services/content'

type SortOption = 'newest' | 'oldest' | 'popular' | 'rating'

export function useFilteredContent() {
  const [searchParams] = useSearchParams()
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const category = searchParams.get('category')
        const language = searchParams.get('language')
        const quality = searchParams.get('quality')
        const sort = (searchParams.get('sort') || 'newest') as SortOption

        const data = await contentService.getFilteredContent({
          category,
          language,
          quality,
          sort,
        })

        setContent(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [searchParams])

  return { content, loading, error }
}
