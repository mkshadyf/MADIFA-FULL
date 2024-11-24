'use client'

import { useQueryWithCache } from '@/lib/hooks/useQueryWithCache'
import type { Tables } from '@/types/supabase'
import Link from 'next/link'
import Image from 'next/image'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function CategoryBrowser() {
  const { data: categories, isLoading } = useQueryWithCache<Tables<'categories'>['Row'][]>(
    ['categories'],
    async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    }
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {categories?.map((category) => (
        <Link
          key={category.id}
          href={`/browse/${category.slug}`}
          className="group relative overflow-hidden rounded-xl aspect-video transition-transform duration-300 hover:scale-105"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={category.thumbnail_url || '/images/category-placeholder.jpg'}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end p-4">
            <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-300 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
} 