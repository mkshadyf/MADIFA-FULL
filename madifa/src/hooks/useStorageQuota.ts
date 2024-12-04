import { storageQuotaManager } from '@/lib/services/storage-quota'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

interface QuotaStats {
  used: number
  quota: number
  percentage: number
  isNearLimit: boolean
}

export function useStorageQuota() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [quotaStats, setQuotaStats] = useState<QuotaStats>({
    used: 0,
    quota: 0,
    percentage: 0,
    isNearLimit: false
  })
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    if (!user) return

    const checkQuota = async () => {
      try {
        const stats = await storageQuotaManager.getQuotaStats(user.id)
        setQuotaStats(stats)

        if (stats.isNearLimit) {
          showToast(
            'You are approaching your storage limit. Consider upgrading your plan or removing some downloads.',
            'warning'
          )
        }
      } catch (error) {
        console.error('Failed to check quota:', error)
      }
    }

    // Check quota initially and every 5 minutes
    checkQuota()
    const interval = setInterval(checkQuota, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [user, showToast])

  const checkDownloadQuota = async (fileSize: number) => {
    if (!user || isChecking) return false

    try {
      setIsChecking(true)
      const { canDownload, remainingSpace } = await storageQuotaManager.checkQuota(
        user.id,
        fileSize
      )

      if (!canDownload) {
        showToast(
          `Not enough storage space. You need ${formatBytes(fileSize)} but only have ${formatBytes(remainingSpace)} available.`,
          'error'
        )
      }

      return canDownload
    } catch (error) {
      console.error('Failed to check download quota:', error)
      showToast('Failed to check storage quota', 'error')
      return false
    } finally {
      setIsChecking(false)
    }
  }

  const enforceQuota = async () => {
    if (!user) return

    try {
      await storageQuotaManager.enforceQuota(user.id)
      const stats = await storageQuotaManager.getQuotaStats(user.id)
      setQuotaStats(stats)
    } catch (error) {
      console.error('Failed to enforce quota:', error)
      showToast('Failed to enforce storage quota', 'error')
    }
  }

  return {
    quotaStats,
    isChecking,
    checkDownloadQuota,
    enforceQuota
  }
}

function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
} 