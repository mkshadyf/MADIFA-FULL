import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/supabase'

type Category = Tables['categories']['Row']

export default function CategorySlider() {
  const [categories, setCategories] = useState<Category[]>([])
  const navigate = useNavigate()
  const supabase = createClient()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (data) {
          setCategories(
            data.map(category => ({
              ...category,
              image_url: category.thumbnail_url, // Map thumbnail_url to image_url
            }))
          )
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="relative">
      <div className="scrollbar-hide flex space-x-4 overflow-x-auto pb-4">
        {categories.map(category => (
          <div
            key={category.id}
            onClick={() => navigate(`/category/${category.slug}`)}
            className="group relative w-64 flex-none cursor-pointer"
          >
            <div className="relative h-36 overflow-hidden rounded-xl">
              <img
                src={
                  category.thumbnail_url || '/images/category-placeholder.jpg'
                }
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-lg font-medium text-white">
                  {category.name}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
