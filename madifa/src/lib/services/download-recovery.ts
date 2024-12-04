import { createClient } from '@/lib/supabase/client'
import { downloadQueueManager } from './download-queue'
import { downloadsManager } from './downloads'

const supabase = createClient()

class DownloadRecoveryService {
  private static instance: DownloadRecoveryService

  static getInstance(): DownloadRecoveryService {
    if (!DownloadRecoveryService.instance) {
      DownloadRecoveryService.instance = new DownloadRecoveryService()
    }
    return DownloadRecoveryService.instance
  }

  async recoverDownloads(userId: string): Promise<void> {
    try {
      // Get all incomplete downloads
      const { data: queueItems, error: queueError } = await supabase
        .from('download_queue')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['queued', 'downloading', 'paused'])
        .order('priority', { ascending: false })

      if (queueError) throw queueError

      // Get all completed downloads for verification
      const { data: downloads, error: downloadsError } = await supabase
        .from('downloads')
        .select('content_id, blob_url')
        .eq('user_id', userId)

      if (downloadsError) throw downloadsError

      // Verify completed downloads still have their blobs
      for (const download of downloads) {
        try {
          const response = await fetch(download.blob_url, { method: 'HEAD' })
          if (!response.ok) {
            // Blob is missing, mark for re-download
            await downloadsManager.removeDownload(download.content_id)
            await downloadQueueManager.addToQueue(download.content_id)
          }
        } catch (error) {
          console.error(`Failed to verify download ${download.content_id}:`, error)
        }
      }

      // Restore queue state
      if (queueItems?.length) {
        await downloadQueueManager.restoreQueue(queueItems)
      }

    } catch (error) {
      console.error('Failed to recover downloads:', error)
      throw error
    }
  }

  async cleanupOrphanedDownloads(): Promise<void> {
    try {
      const { data: orphaned, error } = await supabase.rpc('get_orphaned_downloads')

      if (error) throw error

      for (const download of orphaned) {
        await downloadsManager.removeDownload(download.content_id)
      }
    } catch (error) {
      console.error('Failed to cleanup orphaned downloads:', error)
      throw error
    }
  }
}

export const downloadRecoveryService = DownloadRecoveryService.getInstance() 