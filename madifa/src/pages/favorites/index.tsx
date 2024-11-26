import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/AuthProvider'

interface FavoriteContent {
  id: string
  content: {
    id: string
    title: string
    description: string
    thumbnail_url: string
  }
}

export default function FavoritesPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const { data: favorites = [], isLoading } = useQuery<FavoriteContent[]>({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('favorites')
        .select('*, content(*)')
        .eq('user_id', user?.id)

      return data || []
    },
    enabled: !!user?.id
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">My Favorites</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold">{favorite.content.title}</h3>
              <p className="text-gray-400">{favorite.content.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 