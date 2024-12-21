import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/content'

import { usePathname } from "next/navigation"
export default function CategoryNavigation() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
   const navigate = useNavigate()
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
        setError(
          error instanceof Error ? error.message : 'Failed to load categories'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="overflow-x-auto whitespace-nowrap py-4">
        <div className="flex animate-pulse space-x-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-gray-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>
  }

  return (
    <nav className="overflow-x-auto whitespace-nowrap py-4">
      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/browse')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            pathname === '/browse'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => navigate(`/category/${category.slug}`)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
