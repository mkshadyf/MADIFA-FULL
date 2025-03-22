import { getUserFavorites, getUserRatings, getUserWatchlist } from '@/lib/services/user-interactions'
import type { UserInteractionStats } from '@/types/user'
import { useEffect, useState } from 'react'

export default function UserInteractionsSummary({
  userId,
}: {
  userId: string
}) {
  const [stats, setStats] = useState<UserInteractionStats>({
    favorites: 0,
    ratings: 0,
    watchlist: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      const favorites = await getUserFavorites(userId)
      const ratings = await getUserRatings(userId)
      const watchlist = await getUserWatchlist(userId)

      setStats({
        favorites: favorites.length,
        ratings: ratings.length,
        watchlist: watchlist.length,
      })
    }

    loadStats()
  }, [userId])

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="mb-2 text-xl font-semibold text-white">Favorites</h3>
        <p className="text-3xl font-bold text-indigo-500">{stats.favorites}</p>
        <p className="mt-2 text-sm text-gray-400">Items in your favorites</p>
      </div>

      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="mb-2 text-xl font-semibold text-white">Watchlist</h3>
        <p className="text-3xl font-bold text-indigo-500">{stats.watchlist}</p>
        <p className="mt-2 text-sm text-gray-400">Items to watch later</p>
      </div>

      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="mb-2 text-xl font-semibold text-white">Ratings</h3>
        <p className="text-3xl font-bold text-indigo-500">{stats.ratings}</p>
        <p className="mt-2 text-sm text-gray-400">Content items rated</p>
      </div>
    </div>
  )
}
