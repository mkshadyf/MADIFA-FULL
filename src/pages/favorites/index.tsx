import React from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useQuery } from '@tanstack/react-query'

import { createClient } from '@/lib/supabase/client'

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
    enabled: !!user?.id,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">My Favorites</h1>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map(favorite => (
            <div key={favorite.id} className="rounded-lg bg-gray-800 p-4">
              <h3 className="font-bold text-white">{favorite.content.title}</h3>
              <p className="text-gray-400">{favorite.content.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
