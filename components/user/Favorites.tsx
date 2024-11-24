'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import type { Content } from '@/lib/types/content'

export default function Favorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) loadFavorites()
  }, [user])

  const loadFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_lists')
        .select(`
          *,
          content:content_id (*)
        `)
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
        await supabase
          .from('user_lists')
          .insert({
            user_id: user!.id,
            content_id: contentId,
            list_type: 'favorites'
          })

        // Reload favorites to get the full content data
        loadFavorites()
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Favorites</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((content) => (
          <div
            key={content.id}
            className="bg-gray-800 rounded-lg overflow-hidden"
          >
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                {content.description}
              </p>
              <button
                onClick={() => toggleFavorite(content.id)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
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