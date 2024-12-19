import { useEffect, useState } from 'react'

import {
  getWatchHistory,
  removeFromHistory,
  updateWatchProgress,
} from '@/lib/services/watch-history'
import type { Content } from '@/lib/supabase/types'
import { useAuth } from '@/components/providers/AuthProvider'

interface WatchHistoryItem {
  id: string
  content: Content
  progress: number
  duration: number
  last_watched: string
}

export function useWatchHistory(limit = 20) {
  const { user } = useAuth()
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return

      try {
        const data = await getWatchHistory(user.id, limit)
        setHistory(data)
      } catch (error) {
        logger.error('Error fetching watch history:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load watch history'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, limit])

  const updateProgress = async (
    contentId: string,
    progress: number,
    duration: number
  ) => {
    if (!user) return

    try {
      await updateWatchProgress(user.id, contentId, progress, duration)

      // Update local state
      setHistory(prev =>
        prev.map(item =>
          item.content.id === contentId
            ? {
                ...item,
                progress,
                duration,
                last_watched: new Date().toISOString(),
              }
            : item
        )
      )
    } catch (error) {
      logger.error('Error updating progress:', error)
      throw error
    }
  }

  const removeItem = async (contentId: string) => {
    if (!user) return

    try {
      await removeFromHistory(user.id, contentId)

      // Update local state
      setHistory(prev => prev.filter(item => item.content.id !== contentId))
    } catch (error) {
      logger.error('Error removing item:', error)
      throw error
    }
  }

  return {
    history,
    loading,
    error,
    updateProgress,
    removeItem,
  }
}
