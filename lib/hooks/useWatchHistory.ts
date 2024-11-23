import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'
import { useEffect, useState } from 'react'

interface WatchHistoryItem {
  id: string
  content: Content
  progress: number
  duration: number
  last_watched: string
}

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('viewing_history')
          .select(`
            *,
            content:content_id(*)
          `)
          .order('last_watched', { ascending: false })
          .limit(20)

        if (error) throw error

        setHistory(data || [])
      } catch (error) {
        console.error('Error fetching watch history:', error)
        setError(error instanceof Error ? error.message : 'Failed to load watch history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const updateProgress = async (contentId: string, progress: number, duration: number) => {
    try {
      const { error } = await supabase
        .from('viewing_history')
        .upsert({
          content_id: contentId,
          progress,
          duration,
          last_watched: new Date().toISOString()
        })

      if (error) throw error

      // Update local state
      setHistory(prev => {
        const index = prev.findIndex(item => item.content.id === contentId)
        if (index === -1) return prev

        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          progress,
          duration,
          last_watched: new Date().toISOString()
        }
        return updated
      })
    } catch (error) {
      console.error('Error updating watch progress:', error)
      throw error
    }
  }

  return {
    history,
    loading,
    error,
    updateProgress
  }
} 