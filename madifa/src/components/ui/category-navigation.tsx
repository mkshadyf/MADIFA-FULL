

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types/content'

export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true })

        if (error) throw error

        setCategories(data || [])
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
      <div className="overflow-x-auto whitespace-nowrap py-4">
        <div className="flex space-x-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 bg-gray-800 rounded-full"
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
    <nav className="overflow-x-auto whitespace-nowrap py-4">
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/browse')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            pathname === '/browse'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => router.push(`/category/${category.slug}`)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              pathname === `/category/${category.slug}`
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  )
} 
