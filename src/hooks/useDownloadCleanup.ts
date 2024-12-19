import { useEffect, useState } from 'react'

import { downloadCleanupService } from '@/lib/services/download-cleanup'
import { downloadsManager } from '@/lib/services/downloads'

import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useDownloadCleanup() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isCleaning, setIsCleaning] = useState(false)
  const [storageInfo, setStorageInfo] = useState<{
    used: number
    quota: number
    percentage: number
  }>({ used: 0, quota: 0, percentage: 0 })

  useEffect(() => {
    if (!user) return

    const updateStorageInfo = async () => {
      try {
        const info = await downloadsManager.getStorageUsage()
        setStorageInfo(info)

        // Show warning if storage is running low
        if (info.percentage > 90) {
          showToast(
            'Storage space is running low. Consider removing some downloads.',
            'warning'
          )
        }
      } catch (error) {
        logger.error('Failed to get storage info:', error)
      }
    }

    // Update storage info periodically
    updateStorageInfo()
    const interval = setInterval(updateStorageInfo, 5 * 60 * 1000) // Every 5 minutes

    // Schedule regular cleanup
    downloadCleanupService.scheduleCleanup(user.id)

    return () => {
      clearInterval(interval)
    }
  }, [user, showToast])

  const runCleanup = async () => {
    if (!user || isCleaning) return

    try {
      setIsCleaning(true)
      await downloadCleanupService.cleanupDownloads(user.id)
      const info = await downloadsManager.getStorageUsage()
      setStorageInfo(info)
      showToast('Cleanup completed successfully', 'success')
    } catch (error) {
      logger.error('Failed to run cleanup:', error)
      showToast('Failed to run cleanup', 'error')
    } finally {
      setIsCleaning(false)
    }
  }

  return {
    isCleaning,
    storageInfo,
    runCleanup,
  }
}
