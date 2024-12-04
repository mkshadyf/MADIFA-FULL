import { downloadQueueManager } from '@/lib/services/download-queue'
import type { Content } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from './useToast'

export function useDownloadQueue() {
  const [queueItems, setQueueItems] = useState(downloadQueueManager.getQueueItems())
  const { showToast } = useToast()

  useEffect(() => {
    const handleQueueUpdate = (event: CustomEvent) => {
      setQueueItems(event.detail)
    }

    window.addEventListener('downloadQueueUpdate', handleQueueUpdate as EventListener)
    return () => {
      window.removeEventListener('downloadQueueUpdate', handleQueueUpdate as EventListener)
    }
  }, [])

  const addToQueue = useCallback(async (content: Content, priority = 0) => {
    try {
      await downloadQueueManager.addToQueue(content, priority)
      showToast('Added to download queue', 'success')
    } catch (error) {
      console.error('Failed to add to queue:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to add to queue',
        'error'
      )
    }
  }, [showToast])

  const removeFromQueue = useCallback(async (contentId: string) => {
    try {
      await downloadQueueManager.removeFromQueue(contentId)
      showToast('Removed from download queue', 'success')
    } catch (error) {
      console.error('Failed to remove from queue:', error)
      showToast('Failed to remove from queue', 'error')
    }
  }, [showToast])

  const pauseDownload = useCallback(async (contentId: string) => {
    try {
      await downloadQueueManager.pauseDownload(contentId)
      showToast('Download paused', 'info')
    } catch (error) {
      console.error('Failed to pause download:', error)
      showToast('Failed to pause download', 'error')
    }
  }, [showToast])

  const resumeDownload = useCallback(async (contentId: string) => {
    try {
      await downloadQueueManager.resumeDownload(contentId)
      showToast('Download resumed', 'success')
    } catch (error) {
      console.error('Failed to resume download:', error)
      showToast('Failed to resume download', 'error')
    }
  }, [showToast])

  const clearQueue = useCallback(async () => {
    try {
      await downloadQueueManager.clearQueue()
      showToast('Download queue cleared', 'success')
    } catch (error) {
      console.error('Failed to clear queue:', error)
      showToast('Failed to clear queue', 'error')
    }
  }, [showToast])

  return {
    queueItems,
    addToQueue,
    removeFromQueue,
    pauseDownload,
    resumeDownload,
    clearQueue
  }
} 