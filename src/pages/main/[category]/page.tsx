'use client'

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getCategoryContent } from '@/lib/services/categories'
import type { Content } from '@/lib/supabase/types'
import CategoryNavigation from '@/components/ui/category-navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CategoryPage(): JSX.Element {
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { category } = useParams<{ category: string }>()

  useEffect(() => {
    const fetchContent = async (): Promise<void> => {
      try {
        if (!category) {
          throw new Error('Category parameter is required')
        }
        const data = await getCategoryContent(category)
        setContent(data)
      } catch (err) {
        console.error('Error fetching category content:', err)
        setError(err instanceof Error ? err.message : 'Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [category])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CategoryNavigation />

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {content.map((item: Content) => (
            <div
              key={item.id}
              onClick={() => navigate(`/watch/${item.id}`)}
              className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-gray-800"
            >
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    {item.release_year}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {content.length === 0 && (
          <div className="mt-12 text-center text-gray-400">
            No content available in this category
          </div>
        )}
      </div>
    </div>
  )
}
