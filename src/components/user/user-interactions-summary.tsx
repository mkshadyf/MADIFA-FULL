import React from "react"
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'

import {
  getUserFavorites,
  getUserRatings,
  getUserWatchlist,
} from '@/lib/services/user-interactions'
import type { Content } from '@/types/content'

export default function UserInteractionsSummary() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Content[]>([])
  const [watchlist, setWatchlist] = useState<Content[]>([])
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
   const navigate = useNavigate()

  useEffect(() => {
    const loadInteractions = async () => {
      if (!user) return

      try {
        const [favoritesData, watchlistData, ratingsData] = await Promise.all([
          getUserFavorites(user.id),
          getUserWatchlist(user.id),
          getUserRatings(user.id),
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
          <div key={i} className="h-24 rounded-lg bg-gray-800"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Favorites Summary */}
      <div
        className="cursor-pointer rounded-lg bg-gray-800 p-6 hover:bg-gray-700"
        onClick={() => navigate('/profile/favorites')}
      >
        <h3 className="mb-2 text-xl font-semibold text-white">Favorites</h3>
        <p className="text-3xl font-bold text-indigo-500">{favorites.length}</p>
        <p className="mt-2 text-sm text-gray-400">Items in your favorites</p>
      </div>

      {/* Watchlist Summary */}
      <div
        className="cursor-pointer rounded-lg bg-gray-800 p-6 hover:bg-gray-700"
        onClick={() => navigate('/profile/watchlist')}
      >
        <h3 className="mb-2 text-xl font-semibold text-white">Watchlist</h3>
        <p className="text-3xl font-bold text-indigo-500">{watchlist.length}</p>
        <p className="mt-2 text-sm text-gray-400">Items to watch later</p>
      </div>

      {/* Ratings Summary */}
      <div
        className="cursor-pointer rounded-lg bg-gray-800 p-6 hover:bg-gray-700"
        onClick={() => navigate('/profile/ratings')}
      >
        <h3 className="mb-2 text-xl font-semibold text-white">Ratings</h3>
        <p className="text-3xl font-bold text-indigo-500">{ratings.length}</p>
        <p className="mt-2 text-sm text-gray-400">Content items rated</p>
      </div>
    </div>
  )
}
