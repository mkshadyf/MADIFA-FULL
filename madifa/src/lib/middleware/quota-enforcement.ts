import type { Content } from '@/types'
import { downloadQueueManager } from '../services/download-queue'
import { storageQuotaManager } from '../services/storage-quota'

export class QuotaEnforcementMiddleware {
  private static instance: QuotaEnforcementMiddleware

  static getInstance(): QuotaEnforcementMiddleware {
    if (!QuotaEnforcementMiddleware.instance) {
      QuotaEnforcementMiddleware.instance = new QuotaEnforcementMiddleware()
    }
    return QuotaEnforcementMiddleware.instance
  }

  async enforceQuotaBeforeDownload(userId: string, content: Content): Promise<{
    canProceed: boolean
    message?: string
  }> {
    try {
      // Check if user is near quota limit
      const isNearLimit = await storageQuotaManager.isNearQuota(userId)
      if (isNearLimit) {
        // Clean up old downloads if near limit
        await storageQuotaManager.enforceQuota(userId)
      }

      // Check if there's enough space for the new download
      const { canDownload, remainingSpace } = await storageQuotaManager.checkQuota(
        userId,
        content.size || 0
      )

      if (!canDownload) {
        return {
          canProceed: false,
          message: `Not enough storage space. Required: ${formatBytes(content.size || 0)}, Available: ${formatBytes(remainingSpace)}`
        }
      }

      return { canProceed: true }
    } catch (error) {
      console.error('Quota enforcement error:', error)
      return {
        canProceed: false,
        message: 'Failed to check storage quota'
      }
    }
  }

  async monitorDownloadProgress(userId: string, contentId: string, onQuotaExceeded: () => void): Promise<void> {
    const checkQuota = async () => {
      const { used, quota } = await storageQuotaManager.getQuotaStats(userId)
      if (used > quota) {
        onQuotaExceeded()
        await downloadQueueManager.removeFromQueue(contentId)
      }
    }

    // Check quota every 30 seconds during download
    const interval = setInterval(checkQuota, 30000)
    return () => clearInterval(interval)
  }
}

function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export const quotaEnforcement = QuotaEnforcementMiddleware.getInstance() 