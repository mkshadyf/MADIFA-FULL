

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserWatchlist } from '@/lib/services/user-interactions'
import ContentGrid from '@/components/ui/content-grid'
import Loading from '@/components/ui/loading'
import type { Content } from '@/lib/types/content'

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
        setError(error instanceof Error ? error.message : 'Failed to load watchlist')
      } finally {
        setLoading(false)
      }
    }

    loadWatchlist()
  }, [user])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>
        
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : watchlist.length > 0 ? (
          <ContentGrid content={watchlist} />
        ) : (
          <div className="text-gray-400 text-center py-12">
            Your watchlist is empty. Add content to watch later!
          </div>
        )}
      </div>
    </div>
  )
} 
