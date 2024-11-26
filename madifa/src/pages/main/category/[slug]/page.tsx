'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import CategoryNavigation from '@/components/ui/category-navigation'
import Loading from '@/components/ui/loading'
import type { Content } from '@/lib/supabase/types'
import type { Category } from '@/lib/types/content'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCategoryContent = async () => {
      try {
        // Get category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', params.slug)
          .single()

        if (categoryError) throw categoryError
        setCategory(categoryData)

        // Get category content
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .eq('category', categoryData.id)
          .order('created_at', { ascending: false })

        if (contentError) throw contentError
        setContent(contentData || [])
      } catch (error) {
        console.error('Error fetching category content:', error)
        setError(error instanceof Error ? error.message : 'Failed to load content')
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryContent()
  }, [params.slug])

  if (loading) {
    return <Loading />
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-red-500 text-center">
            {error || 'Category not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CategoryNavigation />

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-white">{category.name}</h1>
          <p className="mt-2 text-gray-400">{category.description}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
                  <p className="text-sm text-gray-300 mt-1">{item.release_year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {content.length === 0 && (
          <div className="text-gray-400 text-center mt-12">
            No content available in this category
          </div>
        )}
      </div>
    </div>
  )
} 