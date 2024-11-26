

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import type { WatchHistoryItem } from '@/lib/types/watch-history'

export default function WatchHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) loadWatchHistory()
  }, [user])

  const loadWatchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select(`
          *,
          content:vimeo_id (
            title,
            thumbnail_url,
            duration
          )
        `)
        .eq('user_id', user!.id)
        .order('last_watched', { ascending: false })
        .limit(50)

      if (error) throw error
      setHistory(data)
    } catch (error) {
      console.error('Error loading watch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user!.id)

      if (error) throw error
      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Watch History</h2>
        <button
          onClick={clearHistory}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Clear History
        </button>
      </div>

      <div className="grid gap-6">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex space-x-4 bg-gray-800 rounded-lg overflow-hidden"
          >
            <img
              src={item.video?.pictures?.sizes[0]?.link}
              alt={item.video?.name}
              className="w-48 h-28 object-cover"
            />
            <div className="flex-1 p-4">
              <h3 className="text-lg font-semibold mb-2">{item.video?.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>
                  Watched: {new Date(item.last_watched).toLocaleDateString()}
                </span>
                <span>
                  Progress: {Math.round(item.progress * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 
