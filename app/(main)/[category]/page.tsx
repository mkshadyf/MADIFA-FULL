'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import Loading from '@/components/ui/loading'
import ContentCard from '@/components/ui/content-card'
import Navbar from '@/components/ui/navbar'
import SearchFilters from '@/components/ui/search-filters'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

export default function CategoryPage() {
  const { category } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [content, setContent] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false })

        if (error) throw error
        setContent(data || [])
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchContent()
    }
  }, [category])

  const handleFilterChange = async (filters: any) => {
    setLoading(true)
    try {
      let query = supabase
        .from('content')
        .select('*')
        .eq('category', category)

      if (filters.language) {
        query = query.eq('language', filters.language)
      }
      if (filters.year) {
        query = query.eq('release_year', filters.year)
      }
      if (filters.rating) {
        query = query.eq('age_rating', filters.rating)
      }

      const { data, error } = await query

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error applying filters:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white capitalize">
              {category?.toString().replace('-', ' ')}
            </h1>
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>

          {content.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {content.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-12">
              No content found in this category
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 