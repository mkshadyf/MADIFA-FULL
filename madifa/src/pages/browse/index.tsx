import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'

interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  category: string
}

export default function BrowsePage() {
  const supabase = createClient()
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  
  const { data: content = [], isLoading } = useQuery<Content[]>({
    queryKey: ['browse-content', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data } = await query
      return data || []
    }
  })

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'movies', name: 'Movies' },
    { id: 'series', name: 'Series' },
    { id: 'music', name: 'Music' }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Browse</h1>
        <div className="flex space-x-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg ${
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

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {content.map((item) => (
            <Link
              key={item.id}
              to={`/watch/${item.id}`}
              className="content-card group"
            >
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="content-card-overlay p-4 flex flex-col justify-end">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 