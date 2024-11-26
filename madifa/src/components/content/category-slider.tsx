

import { useEffect, useState } from 'react'
import { useRouter } from 'react-router-dom'
import { createClient } from '@/lib/supabase/client'
import Image from 'react-router-dom'
import type { Tables } from '@/types/supabase'

type Category = Tables<'categories'>

export default function CategorySlider() {
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (data) {
          setCategories(data.map(category => ({
            ...category,
            image_url: category.thumbnail_url // Map thumbnail_url to image_url
          })))
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [])

  return (
    <div className="relative">
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => router.push(`/category/${category.slug}`)}
            className="flex-none w-64 relative group cursor-pointer"
          >
            <div className="relative h-36 rounded-xl overflow-hidden">
              <Image
                src={category.thumbnail_url || '/images/category-placeholder.jpg'}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0" />
              <div className="absolute inset-0 flex items-end p-4">
                <h3 className="text-white font-medium text-lg">
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
