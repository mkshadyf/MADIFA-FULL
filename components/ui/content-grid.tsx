'use client'

import { useState } from 'react'
import ContentCard from './content-card'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface ContentGridProps {
  title: string
  items: Content[]
  aspectRatio?: 'video' | 'poster'
  showLoadMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
}

export default function ContentGrid({
  title,
  items,
  aspectRatio = 'video',
  showLoadMore = false,
  onLoadMore,
  isLoading = false
}: ContentGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="max-w-7xl mx-auto mt-12 first:mt-0">
      <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <ContentCard
              content={item}
              aspectRatio={aspectRatio}
              priority={index < 5}
            />
          </div>
        ))}
      </div>

      {showLoadMore && items.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No content available
        </div>
      )}
    </section>
  )
} 