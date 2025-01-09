import { downloadService } from '@/lib/services/downloads/download-service'
import type { QueueItem, StorageInfo } from '@/types/downloads'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useDownloads() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    used: 0,
    quota: 0,
    percentage: 0,
  })

  const refreshQueue = useCallback(async () => {
    try {
      setIsLoading(true)
      const [queueData, storage] = await Promise.all([
        downloadService.getQueue(),
        downloadService.getStorageUsage(),
      ])
      setQueue(queueData)
      setStorageInfo(storage)
    } catch (err) {
      showToast('Failed to refresh download queue', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    const handleQueueUpdate = (items: QueueItem[]) => {
      setQueue(items)
    }

    const handleStorageUpdate = (info: StorageInfo) => {
      setStorageInfo(info)
    }

    downloadService.on('queueUpdated', handleQueueUpdate)
    downloadService.on('storageUpdated', handleStorageUpdate)

    if (user?.id) {
      void refreshQueue()
    }

    return () => {
      downloadService.off('queueUpdated', handleQueueUpdate)
      downloadService.off('storageUpdated', handleStorageUpdate)
    }
  }, [user, refreshQueue])

  const runCleanup = useCallback(async () => {
    try {
      if (!user?.id) return
      await downloadService.cleanupDownloads(user.id)
      showToast('Cleanup completed', 'success')
    } catch (err) {
      showToast('Failed to cleanup downloads', 'error')
    }
  }, [user, showToast])

  const recoverFailedDownloads = useCallback(async () => {
    try {
      await downloadService.recoverFailedDownloads()
      showToast('Recovery started for failed downloads', 'success')
    } catch (err) {
      showToast('Failed to recover downloads', 'error')
    }
  }, [showToast])

  return {
    queue,
    isLoading,
    storageInfo,
    runCleanup,
    recoverFailedDownloads,
    refreshQueue,
  }
}
