'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { toggleFavorite, toggleWatchlist, rateContent } from '@/lib/services/user-interactions'
import { useActivityTracking } from '@/lib/hooks/useActivityTracking'

interface ContentInteractionButtonsProps {
  contentId: string
  initialFavorite?: boolean
  initialWatchlist?: boolean
  initialRating?: number
  onInteraction?: () => void
}

export default function ContentInteractionButtons({
  contentId,
  initialFavorite = false,
  initialWatchlist = false,
  initialRating = 0,
  onInteraction
}: ContentInteractionButtonsProps) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isWatchlist, setIsWatchlist] = useState(initialWatchlist)
  const [rating, setRating] = useState(initialRating)
  const [loading, setLoading] = useState(false)
  const { trackLike, trackWatchlistAdd, trackWatchlistRemove } = useActivityTracking()

  const handleFavoriteClick = async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      const newState = await toggleFavorite(contentId, user.id)
      setIsFavorite(newState)
      if (newState) {
        await trackLike(contentId)
      }
      onInteraction?.()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlistClick = async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      const newState = await toggleWatchlist(contentId, user.id)
      setIsWatchlist(newState)
      if (newState) {
        await trackWatchlistAdd(contentId)
      } else {
        await trackWatchlistRemove(contentId)
      }
      onInteraction?.()
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRating = async (value: number) => {
    if (!user || loading) return
    setLoading(true)

    try {
      await rateContent(contentId, user.id, value)
      setRating(value)
      onInteraction?.()
    } catch (error) {
      console.error('Error rating content:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleFavoriteClick}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          isFavorite
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >
        <svg
          className="w-5 h-5 text-white"
          fill={isFavorite ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <button
        onClick={handleWatchlistClick}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          isWatchlist
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-700 hover:bg-gray-600'
        }`}
      >
        <svg
          className="w-5 h-5 text-white"
          fill={isWatchlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRating(value)}
            disabled={loading}
            className={`p-1 rounded-full transition-colors ${
              value <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
} 