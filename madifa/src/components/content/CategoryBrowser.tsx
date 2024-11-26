

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'
import ContentGrid from '@/components/ui/content-grid'
import Loading from '@/components/ui/loading'

type Category = Tables<'categories'>

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('order')
          .eq('is_active', true)

        setCategories(data || [])
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-12">
      {categories.map((category) => (
        <section key={category.id} className="animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-6">
            {category.name}
          </h2>
          <ContentGrid
            items={[]} // You'll need to load content for each category
            aspectRatio="poster"
            showLoadMore={false}
          />
        </section>
      ))}
    </div>
  )
} 
