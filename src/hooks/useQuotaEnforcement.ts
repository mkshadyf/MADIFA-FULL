import { type SubscriptionService } from '@/lib/services/subscription/index'
import type { Content } from '@/types/content'
import type { QuotaCheckResult } from '@/types/quota'
import { useCallback } from 'react'
import { useAuth } from './useAuth'

export interface QuotaEnforcement {
  checkQuota: (userId: string, contentId: string) => Promise<QuotaCheckResult>
  checkQuotaBeforeDownload: (content: Content) => Promise<QuotaCheckResult>
  updateUsage: (size: number) => Promise<void>
  startQuotaMonitoring: (userId: string) => void
  stopQuotaMonitoring: (userId: string) => void
}

export function useQuotaEnforcement(
  subscriptionService: SubscriptionService
): QuotaEnforcement {
  const { user } = useAuth()

  const checkQuota = useCallback(
    async (userId: string, contentId: string): Promise<QuotaCheckResult> => {
      try {
        const result = await subscriptionService.checkAccess(userId, contentId)
        return {
          allowed: result.canProceed,
          canProceed: result.canProceed,
          currentUsage: result.currentUsage,
          quota: result.quota,
          remaining: result.remaining,
          error: result.error,
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
    },
    [subscriptionService]
  )

  const checkQuotaBeforeDownload = useCallback(
    async (content: Content): Promise<QuotaCheckResult> => {
      try {
        const result = await subscriptionService.checkQuotaBeforeDownload(
          user?.id || '',
          content.fileSize || content.size || 0
        )
        return {
          allowed: result.canProceed,
          canProceed: result.canProceed,
          currentUsage: result.currentUsage,
          quota: result.quota,
          remaining: result.remaining,
          error: result.error,
        }
      } catch (error) {
        console.error('Failed to check quota before download:', error)
        return {
          allowed: false,
          canProceed: false,
          currentUsage: 0,
          quota: 0,
          remaining: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    },
    [subscriptionService, user]
  )

  const startQuotaMonitoring = useCallback(
    (userId: string) => {
      if (!userId) return
      subscriptionService.startQuotaMonitoring(userId)
    },
    [subscriptionService]
  )

  const stopQuotaMonitoring = useCallback(
    (userId: string) => {
      if (!userId) return
      subscriptionService.stopQuotaMonitoring(userId)
    },
    [subscriptionService]
  )

  const updateUsage = useCallback(
    async (size: number): Promise<void> => {
      if (!user?.id) return
      try {
        await subscriptionService.updateUsage(user.id, size)
      } catch (error) {
        console.error('Failed to update usage:', error)
      }
    },
    [subscriptionService, user]
  )

  return {
    checkQuota,
    checkQuotaBeforeDownload,
    updateUsage,
    startQuotaMonitoring,
    stopQuotaMonitoring,
  }
}
