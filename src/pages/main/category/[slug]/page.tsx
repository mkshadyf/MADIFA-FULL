'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'
import type { Category } from '@/types/content'
import CategoryNavigation from '@/components/ui/category-navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
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
        setError(
          error instanceof Error ? error.message : 'Failed to load content'
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchCategoryContent()
  }, [params.slug])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">
            {error || 'Category not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CategoryNavigation />

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-white">{category.name}</h1>
          <p className="mt-2 text-gray-400">{category.description}</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {content.map(item => (
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
