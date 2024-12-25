import type { SubscriptionService } from '@/lib/services/subscription'
import type { Content } from '@/types/content'
import { useCallback } from 'react'

export interface QuotaCheckResult {
  allowed: boolean
  error?: string
  canProceed: boolean
  currentUsage: number
  quota: number
  remaining: number
}

export interface QuotaEnforcement {
  checkQuota: (userId: string, contentId: string) => Promise<QuotaCheckResult>
  checkQuotaBeforeDownload: (content: Content) => Promise<boolean>
  updateUsage: (size: number) => Promise<void>
  startQuotaMonitoring: () => void
  stopQuotaMonitoring: () => void
}

export function useQuotaEnforcement(subscriptionService: SubscriptionService): QuotaEnforcement {
  const checkQuota = useCallback(async (userId: string, contentId: string): Promise<QuotaCheckResult> => {
    try {
      const result = await subscriptionService.checkAccess(userId, contentId)
      return {
        ...result,
        allowed: result.canProceed,
        currentUsage: result.currentUsage || 0,
        quota: result.quota || 0,
        remaining: result.remaining || 0,
      }
    } catch (error) {
      return {
        allowed: false,
        canProceed: false,
        currentUsage: 0,
        quota: 0,
        remaining: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
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

  const updateUsage = useCallback(async (size: number): Promise<void> => {
    try {
      await subscriptionService.updateUsage(size)
    } catch (error) {
      console.error('Failed to update usage:', error)
    }
  }, [subscriptionService])

  return {
    checkQuota,
    checkQuotaBeforeDownload,
    updateUsage,
    startQuotaMonitoring,
    stopQuotaMonitoring
  }
}
