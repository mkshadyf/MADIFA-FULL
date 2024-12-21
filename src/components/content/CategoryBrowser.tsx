import React from "react"
import { useEffect, useState } from 'react'

import type { Tables } from '@/types/supabase'
import { createClient } from '@/lib/supabase/client'
import ContentGrid from '@/components/ui/content-grid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'


type Category = Tables['categories']['Row']

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

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-12">
      {categories.map(category => (
        <section key={category.id} className="animate-fade-in">
          <h2 className="mb-6 text-2xl font-bold text-white">
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
