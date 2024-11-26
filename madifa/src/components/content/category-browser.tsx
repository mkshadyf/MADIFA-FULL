

import { useState, useEffect } from 'react'
import { useRouter } from 'react-router-dom'
import { getCategories } from '@/lib/services/categories'
import type { Category } from '@/lib/types/content'

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError(error instanceof Error ? error.message : 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-800 rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => router.push(`/category/${category.slug}`)}
            className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
          >
            {category.thumbnail_url && (
              <img
                src={category.thumbnail_url}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-medium">{category.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-300">
                    {category.content_count} titles
                  </span>
                  {category.total_views && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-300">
                        {category.total_views.toLocaleString()} views
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
