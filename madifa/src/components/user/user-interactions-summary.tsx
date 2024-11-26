

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getUserFavorites, getUserWatchlist, getUserRatings } from '@/lib/services/user-interactions'
import { useRouter } from 'react-router-dom'
import type { Content } from '@/lib/types/content'

export default function UserInteractionsSummary() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Content[]>([])
  const [watchlist, setWatchlist] = useState<Content[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadInteractions = async () => {
      if (!user) return

      try {
        const [favoritesData, watchlistData, ratingsData] = await Promise.all([
          getUserFavorites(user.id),
          getUserWatchlist(user.id),
          getUserRatings(user.id)
        ])

        setFavorites(favoritesData)
        setWatchlist(watchlistData)
        setRatings(ratingsData)
      } catch (error) {
        console.error('Error loading interactions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadInteractions()
  }, [user])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Favorites Summary */}
      <div
        className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
        onClick={() => router.push('/profile/favorites')}
      >
        <h3 className="text-xl font-semibold text-white mb-2">Favorites</h3>
        <p className="text-3xl font-bold text-indigo-500">{favorites.length}</p>
        <p className="text-sm text-gray-400 mt-2">Items in your favorites</p>
      </div>

      {/* Watchlist Summary */}
      <div
        className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
        onClick={() => router.push('/profile/watchlist')}
      >
        <h3 className="text-xl font-semibold text-white mb-2">Watchlist</h3>
        <p className="text-3xl font-bold text-indigo-500">{watchlist.length}</p>
        <p className="text-sm text-gray-400 mt-2">Items to watch later</p>
      </div>

      {/* Ratings Summary */}
      <div
        className="bg-gray-800 p-6 rounded-lg cursor-pointer hover:bg-gray-700"
        onClick={() => router.push('/profile/ratings')}
      >
        <h3 className="text-xl font-semibold text-white mb-2">Ratings</h3>
        <p className="text-3xl font-bold text-indigo-500">{ratings.length}</p>
        <p className="text-sm text-gray-400 mt-2">Content items rated</p>
      </div>
    </div>
  )
} 
