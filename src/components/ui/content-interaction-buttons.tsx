import { IconButton } from '@/components/ui'
import { useActivityTracking } from '@/hooks/useActivityTracking'
import { useAuth } from '@/hooks/useAuth'
import { toggleFavorite, toggleWatchlist, rateContent } from '@/lib/services/user-interactions'
import { useState } from 'react'

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
  onInteraction,
}: ContentInteractionButtonsProps) {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isWatchlist, setIsWatchlist] = useState(initialWatchlist)
  const [rating, setRating] = useState(initialRating)
  const [loading, setLoading] = useState(false)
  const { trackLike, trackWatchlistAdd, trackWatchlistRemove } =
    useActivityTracking()

  const handleFavoriteClick = async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      await toggleFavorite(user.id, contentId)
      setIsFavorite(!isFavorite)
      if (!isFavorite) {
        await trackLike(contentId)
      }
      onInteraction?.()
    } catch (error) {
      console.error(`Error toggling favorite: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlistClick = async () => {
    if (!user || loading) return
    setLoading(true)

    try {
      await toggleWatchlist(user.id, contentId)
      setIsWatchlist(!isWatchlist)
      if (!isWatchlist) {
        await trackWatchlistAdd(contentId)
      } else {
        await trackWatchlistRemove(contentId)
      }
      onInteraction?.()
    } catch (error) {
      console.error(`Error toggling watchlist: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRating = async (value: number) => {
    if (!user || loading) return
    setLoading(true)

    try {
      await rateContent(user.id, contentId, value)
      setRating(value)
      onInteraction?.()
    } catch (error) {
      console.error(`Error rating content: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <IconButton
        icon="heart"
        label="Favorite"
        onClick={handleFavoriteClick}
        disabled={loading}
        className={`${
          isFavorite
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      />

      <IconButton
        icon="plus"
        label="Add to watchlist"
        onClick={handleWatchlistClick}
        disabled={loading}
        className={`${
          isWatchlist
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
      />

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(value => (
          <IconButton
            key={value}
            icon="star"
            label={`Rate ${value} stars`}
            onClick={() => handleRating(value)}
            disabled={loading}
            className={`${
              value <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
