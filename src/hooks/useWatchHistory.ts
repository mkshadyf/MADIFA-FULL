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
    async function fetchHistory() {
      if (!user) {
        setHistory([])
        setLoading(false)
        return
      }

      try {
        const items = await watchHistoryService.getWatchHistory(user.id, limit)
        setHistory(items)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch watch history'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, limit])

  const updateProgress = async (contentId: string, progress: number) => {
    if (!user) return

    try {
      await watchHistoryService.updateWatchProgress(
        user.id,
        contentId,
        progress
      )
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
      throw err
    }
  }

  const removeItem = async (contentId: string) => {
    if (!user) return

    try {
      await watchHistoryService.removeFromHistory(user.id, contentId)
      setHistory(prev => prev.filter(item => item.vimeo_id !== contentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item')
      throw err
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
