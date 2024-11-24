'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserFavorites } from '@/lib/services/user-interactions'
import ContentGrid from '@/components/ui/content-grid'
import Loading from '@/components/ui/loading'
import type { Content } from '@/lib/types/content'

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return

      try {
        const data = await getUserFavorites(user.id)
        setFavorites(data)
      } catch (error) {
        console.error('Error loading favorites:', error)
        setError(error instanceof Error ? error.message : 'Failed to load favorites')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Favorites</h1>
        
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : favorites.length > 0 ? (
          <ContentGrid content={favorites} />
        ) : (
          <div className="text-gray-400 text-center py-12">
            No favorites yet. Start exploring content to add to your favorites!
          </div>
        )}
      </div>
    </div>
  )
} 