import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'

export default function Favorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) void loadFavorites()
  }, [user])

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .select(
          `
          *,
          content:content_id (*)
        `
        )
        .eq('user_id', user!.id)
        .eq('list_type', 'favorites')

      if (error) throw error
      setFavorites(data.map(item => item.content))
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (contentId: string) => {
    try {
      const exists = favorites.some(f => f.id === contentId)

      if (exists) {
        await supabase
          .from('user_lists')
          .delete()
          .eq('user_id', user!.id)
          .eq('content_id', contentId)
          .eq('list_type', 'favorites')

        setFavorites(prev => prev.filter(f => f.id !== contentId))
      } else {
        await supabase.from('user_lists').insert({
          user_id: user!.id,
          content_id: contentId,
          list_type: 'favorites',
        })

        // Reload favorites to get the full content data
        void loadFavorites()
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="mb-6 text-2xl font-bold">My Favorites</h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {favorites.map(content => (
          <div
            key={content.id}
            className="overflow-hidden rounded-lg bg-gray-800"
          >
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold">{content.title}</h3>
              <p className="mb-4 line-clamp-2 text-sm text-gray-400">
                {content.description}
              </p>
              <button
                onClick={() => toggleFavorite(content.id)}
                className="w-full rounded-lg bg-red-600 px-4 py-2 transition-colors hover:bg-red-700"
              >
                Remove from Favorites
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
