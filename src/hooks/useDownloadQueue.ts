import { useCallback, useState } from 'react'

interface QueueItem {
  id: string
  progress: number
  status: 'pending' | 'downloading' | 'completed' | 'error'
}

export function useDownloadQueue() {
  const [items, setItems] = useState<QueueItem[]>([])

  const addToQueue = useCallback((item: QueueItem) => {
    setItems(prev => [...prev, item])
  }, [])

  const removeFromQueue = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const clearQueue = useCallback(() => {
    setItems([])
  }, [])

  const updateProgress = useCallback((id: string, progress: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, progress } : item
      )
    )
  }, [])

  const updateStatus = useCallback((id: string, status: QueueItem['status']) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    )
  }, [])

  return {
    items,
    addToQueue,
    removeFromQueue,
    clearQueue,
    updateProgress,
    updateStatus
  }
}
