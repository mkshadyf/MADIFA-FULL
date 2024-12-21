import type { Content } from '@/types'
import { useEffect, useRef } from 'react'

import { QuotaEnforcementMiddleware } from '@/middleware/quota-enforcement'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useQuotaEnforcement() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const monitorCleanupRef = useRef<() => void>()

  useEffect(() => {
    return () => {
      if (monitorCleanupRef.current) {
        monitorCleanupRef.current()
      }
    }
  }, [])

  const checkQuotaBeforeDownload = async (content: Content) => {
    if (!user) return false

    try {
      const { canProceed, message } =
        await QuotaEnforcementMiddleware.enforceQuotaBeforeDownload(user.id, content)

      if (!canProceed && message) {
        showToast(message, 'error')
      }

      return canProceed
    } catch (error) {
      console.error('Failed to check quota:', error)
      showToast('Failed to check storage quota', 'error')
      return false
    }
  }

  const startQuotaMonitoring = async (contentId: string) => {
    if (!user) return

    try {
      // Stop any existing monitoring
      if (monitorCleanupRef.current) {
        monitorCleanupRef.current()
      }

      // Start new monitoring
      monitorCleanupRef.current =
        await QuotaEnforcementMiddleware.monitorDownloadProgress(
          user.id,
          contentId,
          () => {
            showToast(
              'Download stopped: Storage quota exceeded. Please free up space.',
              'error'
            )
          }
        )
    } catch (error) {
      console.error('Failed to start quota monitoring:', error)
    }
  }

  const stopQuotaMonitoring = () => {
    if (monitorCleanupRef.current) {
      monitorCleanupRef.current()
      monitorCleanupRef.current = undefined
    }
  }

  return {
    checkQuotaBeforeDownload,
    startQuotaMonitoring,
    stopQuotaMonitoring,
  }
}
