'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Category, CategoryWithContent } from '@/lib/types/category'
import type { Content } from '@/lib/supabase/types'

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<CategoryWithContent[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch categories with content count and stats
        const { data, error } = await supabase
          .from('categories')
          .select(`
            *,
            content:content(count),
            content_stats:content_stats(
              total_views,
              average_rating
            )
          `)
          .eq('is_active', true)
          .order('order', { ascending: true })

        if (error) throw error

        const categoriesWithStats = data?.map(category => ({
          ...category,
          content_count: category.content?.[0]?.count || 0,
          total_views: category.content_stats?.[0]?.total_views || 0,
          average_rating: category.content_stats?.[0]?.average_rating || 0
        })) || []

        setCategories(categoriesWithStats)

        // If no category is selected, select the first one
        if (!selectedCategory && categoriesWithStats.length > 0) {
          setSelectedCategory(categoriesWithStats[0].id)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchCategoryContent = async () => {
      if (!selectedCategory) return

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('category_id', selectedCategory)
          .order('created_at', { ascending: false })

        if (error) throw error

        setContent(data)
      } catch (error) {
        console.error('Error fetching category content:', error)
        setError('Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryContent()
  }, [selectedCategory])

  return (
    <div className="space-y-8">
      {/* Category Navigation */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
            <span className="ml-2 text-sm opacity-75">
              ({category.content_count})
            </span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-video bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {content.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/watch/${item.id}`)}
              className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
            >
              {item.thumbnail_url && (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-300">{item.release_year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      {!loading && content.length === 0 && (
        <div className="text-gray-400 text-center py-8">
          No content in this category
        </div>
      )}
    </div>
  )
} 