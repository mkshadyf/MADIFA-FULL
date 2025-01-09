import { useEffect, useState } from 'react'

import { ContentGrid } from '@/components/ui/content-grid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getUserWatchlist } from '@/lib/services/user-interactions'
import { useAuth } from '@/providers/AuthProvider'
import type { Content } from '@/types/content'

export default function WatchlistPage() {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWatchlist = async () => {
      if (!user) return

      try {
        const data = await getUserWatchlist(user.id)
        setWatchlist(data)
      } catch (error) {
        console.error('Error loading watchlist:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load watchlist'
        )
      } finally {
        setLoading(false)
      }
    }

    void loadWatchlist()
  }, [user])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-white">My Watchlist</h1>

        {error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : watchlist.length > 0 ? (
          <ContentGrid items={watchlist} />
        ) : (
          <div className="py-12 text-center text-gray-400">
            Your watchlist is empty. Add content to watch later!
          </div>
        )}
      </div>
    </div>
  )
}
