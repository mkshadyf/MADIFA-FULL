import { watchHistoryService } from '@/lib/services/watch-history'
import { useAuth } from '@/providers/AuthProvider'
import type { WatchHistoryItem } from '@/types/watch-history'
import { useEffect, useState } from 'react'

interface UseWatchHistoryResult {
  history: WatchHistoryItem[]
  loading: boolean
  error: string | null
  updateProgress: (contentId: string, progress: number) => Promise<void>
  removeItem: (contentId: string) => Promise<void>
}

export function useWatchHistory(limit = 20): UseWatchHistoryResult {
  const { user } = useAuth()
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const data = await watchHistoryService.getWatchHistory(user.id, limit)
        setHistory(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching watch history:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load watch history'
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchHistory()
  }, [user, limit])

  const updateProgress = async (contentId: string, progress: number) => {
    if (!user) return

    try {
      await watchHistoryService.updateWatchProgress(
        user.id,
        contentId,
        progress
      )

      // Update local state
      setHistory(prev =>
        prev.map(item =>
          item.vimeo_id === contentId
            ? {
                ...item,
                progress,
                last_watched: new Date().toISOString(),
                completed: progress >= 0.95,
              }
            : item
        )
      )
      setError(null)
    } catch (error) {
      console.error('Error updating progress:', error)
      throw error
    }
  }

  const removeItem = async (contentId: string) => {
    if (!user) return

    try {
      await watchHistoryService.removeFromHistory(user.id, contentId)

      // Update local state
      setHistory(prev => prev.filter(item => item.vimeo_id !== contentId))
      setError(null)
    } catch (error) {
      console.error('Error removing item:', error)
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
