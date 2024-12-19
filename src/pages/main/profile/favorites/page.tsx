import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { getUserFavorites } from '@/lib/services/user-interactions'
import type { Content } from '@/lib/types/content'
import ContentGrid from '@/components/ui/content-grid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { logger } from '@/lib/logger'

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
        logger.error('Error loading favorites:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load favorites'
        )
      } finally {
        setLoading(false)
      }
    }

    void loadFavorites()
  }, [user])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-white">My Favorites</h1>

        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : favorites.length > 0 ? (
          <ContentGrid items={favorites} />
        ) : (
          <div className="py-12 text-center text-gray-400">
            No favorites yet. Start exploring content to add to your favorites!
          </div>
        )}
      </div>
    </div>
  )
}
