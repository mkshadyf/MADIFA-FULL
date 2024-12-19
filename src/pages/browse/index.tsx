import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { createClient } from '@/lib/supabase/client'
import { useFilteredContent } from '@/hooks/useFilteredContent'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ContentFilters from '@/components/content/ContentFilters'
import FeaturedContent from '@/components/content/FeaturedContent'
import RecommendedContent from '@/components/content/RecommendedContent'

interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  category: string
}

export default function BrowsePage () {
  const supabase = createClient()
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')

  const { data: content = [], isLoading } = useQuery<Content[]>({
    queryKey: ['browse-content', selectedCategory],
    queryFn: async () => {
      let query = supabase.from('content').select('*').order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data } = await query
      return data || []
    },
  })

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'movies', name: 'Movies' },
    { id: 'series', name: 'Series' },
    { id: 'music', name: 'Music' },
  ]

  const { content: filteredContent, loading: filterLoading } = useFilteredContent()

  const displayContent = selectedCategory === 'all' ? content : filteredContent

  return (
    <div className="space-y-8">
      <FeaturedContent />

      <ContentFilters
        onFilterChange={filters => {
          setSelectedCategory('all')
        }}
      />

      <RecommendedContent limit={10} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Browse</h1>
          <div className="flex space-x-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-lg px-4 py-2 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading || filterLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayContent.map(item => (
              <Link key={item.id} to={`/watch/${item.id}`} className="content-card group">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="content-card-overlay flex flex-col justify-end p-4">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="line-clamp-2 text-sm text-gray-300">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
