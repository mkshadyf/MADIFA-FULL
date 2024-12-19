import { useEffect, useState } from 'react'

import { downloadRecoveryService } from '@/lib/services/download-recovery'

import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useDownloadRecovery() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isRecovering, setIsRecovering] = useState(false)
  const [lastRecoveryTime, setLastRecoveryTime] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) return

    const recoverDownloads = async () => {
      try {
        setIsRecovering(true)
        await downloadRecoveryService.recoverDownloads(user.id)
        setLastRecoveryTime(new Date())
      } catch (error) {
        logger.error('Failed to recover downloads:', error)
        showToast('Failed to recover downloads', 'error')
      } finally {
        setIsRecovering(false)
      }
    }

    // Check if we need to recover (e.g., after app crash or network failure)
    const lastRecovery = localStorage.getItem('lastDownloadRecovery')
    const shouldRecover =
      !lastRecovery ||
      Date.now() - new Date(lastRecovery).getTime() > 1000 * 60 * 60 // 1 hour

    if (shouldRecover) {
      recoverDownloads()
    }

    // Cleanup orphaned downloads periodically
    const cleanupInterval = setInterval(
      () => {
        downloadRecoveryService.cleanupOrphanedDownloads().catch(error => {
          logger.error('Failed to cleanup orphaned downloads:', error)
        })
      },
      1000 * 60 * 60 * 24
    ) // Daily

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [user, showToast])

  const forceRecover = async () => {
    if (!user || isRecovering) return

    try {
      setIsRecovering(true)
      await downloadRecoveryService.recoverDownloads(user.id)
      setLastRecoveryTime(new Date())
      showToast('Downloads recovered successfully', 'success')
    } catch (error) {
      logger.error('Failed to recover downloads:', error)
      showToast('Failed to recover downloads', 'error')
    } finally {
      setIsRecovering(false)
    }
  }

  return {
    isRecovering,
    lastRecoveryTime,
    forceRecover,
  }
}
