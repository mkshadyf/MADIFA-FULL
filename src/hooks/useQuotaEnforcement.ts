import type { SubscriptionService } from '@/lib/services/subscription'
import type { Content } from '@/types/content'
import { useCallback } from 'react'

export interface QuotaCheckResult {
  canProceed: boolean
  message?: string
}

export interface QuotaEnforcement {
  checkQuota: (userId: string, contentId: string) => Promise<QuotaCheckResult>
  checkQuotaBeforeDownload: (content: Content) => Promise<boolean>
  startQuotaMonitoring: () => void
  stopQuotaMonitoring: () => void
}

export function useQuotaEnforcement(subscriptionService: SubscriptionService): QuotaEnforcement {
  const checkQuota = useCallback(async (userId: string, contentId: string): Promise<QuotaCheckResult> => {
    try {
      return await subscriptionService.checkAccess(userId, contentId)
    } catch (error) {
      return {
        canProceed: false,
        message: 'Failed to check quota. Please try again later.'
      }
    }
  }, [subscriptionService])

  const checkQuotaBeforeDownload = useCallback(async (content: Content): Promise<boolean> => {
    try {
      const result = await subscriptionService.checkQuotaBeforeDownload(content)
      return result.canProceed
    } catch (error) {
      console.error('Failed to check quota before download:', error)
      return false
    }
  }, [subscriptionService])

  const startQuotaMonitoring = useCallback(() => {
    subscriptionService.startQuotaMonitoring()
  }, [subscriptionService])

  const stopQuotaMonitoring = useCallback(() => {
    subscriptionService.stopQuotaMonitoring()
  }, [subscriptionService])

  return {
    checkQuota,
    checkQuotaBeforeDownload,
    startQuotaMonitoring,
    stopQuotaMonitoring
  }
}
