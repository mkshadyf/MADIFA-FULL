import { createClient } from '@/lib/supabase/client'

import { downloadsManager } from './downloads'

const supabase = createClient()

class DownloadCleanupService {
  private static instance: DownloadCleanupService
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days
  private readonly MIN_STORAGE = 1024 * 1024 * 1024 // 1GB

  static getInstance(): DownloadCleanupService {
    if (!DownloadCleanupService.instance) {
      DownloadCleanupService.instance = new DownloadCleanupService()
    }
    return DownloadCleanupService.instance
  }

  async cleanupDownloads(userId: string): Promise<void> {
    try {
      // Get storage usage
      const { used, quota } = await downloadsManager.getStorageUsage()
      const available = quota - used

      if (available > this.MIN_STORAGE) {
        // Still enough storage, only cleanup old downloads
        await this.cleanupOldDownloads(userId)
      } else {
        // Low on storage, need to be more aggressive
        await this.cleanupLowStorage(userId)
      }
    } catch (error) {
      console.error('Failed to cleanup downloads:', error)
      throw error
    }
  }

  private async cleanupOldDownloads(userId: string): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.MAX_AGE)

    const { data: oldDownloads, error } = await supabase
      .from('downloads')
      .select('content_id')
      .eq('user_id', userId)
      .lt('last_accessed', cutoffDate.toISOString())

    if (error) throw error

    for (const download of oldDownloads) {
      await downloadsManager.removeDownload(download.content_id)
    }
  }

  private async cleanupLowStorage(userId: string): Promise<void> {
    // Get downloads sorted by last accessed
    const { data: downloads, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', userId)
      .order('last_accessed', { ascending: true })

    if (error) throw error

    // Calculate total size and identify downloads to remove
    let totalSize = 0
    const toRemove: string[] = []

    for (const download of downloads) {
      totalSize += download.size
      if (totalSize > this.MIN_STORAGE) {
        toRemove.push(download.content_id)
      }
    }

    // Remove downloads until we have enough space
    for (const contentId of toRemove) {
      await downloadsManager.removeDownload(contentId)
    }
  }

  async scheduleCleanup(userId: string): Promise<void> {
    setInterval(() => {
      this.cleanupDownloads(userId).catch(error => {
        console.error('Scheduled cleanup failed:', error)
      })
    }, this.CLEANUP_INTERVAL)
  }
}

export const downloadCleanupService = DownloadCleanupService.getInstance()
