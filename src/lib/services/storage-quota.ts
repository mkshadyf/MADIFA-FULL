import { createClient } from '@/lib/supabase/client'

import { downloadsManager } from './downloads'

const supabase = createClient()

class StorageQuotaManager {
  private static instance: StorageQuotaManager
  private readonly DEFAULT_QUOTA = 5 * 1024 * 1024 * 1024 // 5GB
  private readonly PREMIUM_QUOTA = 50 * 1024 * 1024 * 1024 // 50GB
  private readonly WARNING_THRESHOLD = 0.9 // 90%

  static getInstance(): StorageQuotaManager {
    if (!StorageQuotaManager.instance) {
      StorageQuotaManager.instance = new StorageQuotaManager()
    }
    return StorageQuotaManager.instance
  }

  async getUserQuota(userId: string): Promise<number> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    return profile?.subscription_tier === 'premium'
      ? this.PREMIUM_QUOTA
      : this.DEFAULT_QUOTA
  }

  async checkQuota(
    userId: string,
    fileSize: number
  ): Promise<{
    canDownload: boolean
    remainingSpace: number
    quota: number
  }> {
    const quota = await this.getUserQuota(userId)
    const { used } = await downloadsManager.getStorageUsage()
    const remainingSpace = quota - used

    return {
      canDownload: remainingSpace >= fileSize,
      remainingSpace,
      quota,
    }
  }

  async enforceQuota(userId: string): Promise<void> {
    const quota = await this.getUserQuota(userId)
    const { used } = await downloadsManager.getStorageUsage()

    if (used > quota) {
      // Get downloads sorted by last accessed
      const { data: downloads } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: true })

      if (!downloads) return

      let totalSize = used
      for (const download of downloads) {
        if (totalSize <= quota) break
        await downloadsManager.removeDownload(download.content_id)
        totalSize -= download.size
      }
    }
  }

  async isNearQuota(userId: string): Promise<boolean> {
    const quota = await this.getUserQuota(userId)
    const { used } = await downloadsManager.getStorageUsage()
    return used / quota > this.WARNING_THRESHOLD
  }

  async getQuotaStats(userId: string): Promise<{
    used: number
    quota: number
    percentage: number
    isNearLimit: boolean
  }> {
    const quota = await this.getUserQuota(userId)
    const { used } = await downloadsManager.getStorageUsage()
    const percentage = (used / quota) * 100

    return {
      used,
      quota,
      percentage,
      isNearLimit: percentage > this.WARNING_THRESHOLD * 100,
    }
  }
}

export const storageQuotaManager = StorageQuotaManager.getInstance()
