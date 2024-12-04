import { createClient } from '@/lib/supabase/client'
import { Content } from '@/types'
import { downloadsManager } from './downloads'

interface QueueItem {
  id: string
  content: Content
  priority: number
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error'
  progress: number
  error?: string
  addedAt: number
}

class DownloadQueueManager {
  private static instance: DownloadQueueManager
  private queue: Map<string, QueueItem> = new Map()
  private activeDownloads = 0
  private readonly MAX_CONCURRENT_DOWNLOADS = 3
  private supabase = createClient()

  static getInstance(): DownloadQueueManager {
    if (!DownloadQueueManager.instance) {
      DownloadQueueManager.instance = new DownloadQueueManager()
    }
    return DownloadQueueManager.instance
  }

  async addToQueue(content: Content, priority: number = 0): Promise<void> {
    if (this.queue.has(content.id)) {
      throw new Error('Content already in queue')
    }

    const queueItem: QueueItem = {
      id: content.id,
      content,
      priority,
      status: 'queued',
      progress: 0,
      addedAt: Date.now()
    }

    this.queue.set(content.id, queueItem)
    await this.saveQueueState()
    this.processQueue()
  }

  async removeFromQueue(contentId: string): Promise<void> {
    this.queue.delete(contentId)
    await this.saveQueueState()
  }

  async pauseDownload(contentId: string): Promise<void> {
    const item = this.queue.get(contentId)
    if (item && item.status === 'downloading') {
      item.status = 'paused'
      this.queue.set(contentId, item)
      await this.saveQueueState()
      this.activeDownloads--
      this.processQueue()
    }
  }

  async resumeDownload(contentId: string): Promise<void> {
    const item = this.queue.get(contentId)
    if (item && item.status === 'paused') {
      item.status = 'queued'
      this.queue.set(contentId, item)
      await this.saveQueueState()
      this.processQueue()
    }
  }

  async clearQueue(): Promise<void> {
    this.queue.clear()
    await this.saveQueueState()
  }

  getQueueItems(): QueueItem[] {
    return Array.from(this.queue.values())
      .sort((a, b) => b.priority - a.priority || a.addedAt - b.addedAt)
  }

  private async processQueue(): Promise<void> {
    if (this.activeDownloads >= this.MAX_CONCURRENT_DOWNLOADS) return

    const queuedItems = this.getQueueItems()
      .filter(item => item.status === 'queued')

    for (const item of queuedItems) {
      if (this.activeDownloads >= this.MAX_CONCURRENT_DOWNLOADS) break

      this.activeDownloads++
      item.status = 'downloading'
      this.queue.set(item.id, item)

      try {
        await downloadsManager.downloadContent(item.id, {
          onProgress: (downloaded, total) => {
            const progress = (downloaded / total) * 100
            item.progress = progress
            this.queue.set(item.id, item)
            this.notifyQueueUpdate()
          }
        })

        item.status = 'completed'
        this.queue.set(item.id, item)
      } catch (error) {
        item.status = 'error'
        item.error = error instanceof Error ? error.message : 'Download failed'
        this.queue.set(item.id, item)
      } finally {
        this.activeDownloads--
        await this.saveQueueState()
        this.processQueue()
      }
    }
  }

  private async saveQueueState(): Promise<void> {
    const { error } = await this.supabase
      .from('download_queue')
      .upsert([{
        user_id: (await this.supabase.auth.getUser()).data.user?.id,
        queue_state: Array.from(this.queue.entries())
      }])

    if (error) {
      console.error('Failed to save queue state:', error)
    }
  }

  private notifyQueueUpdate(): void {
    window.dispatchEvent(new CustomEvent('downloadQueueUpdate', {
      detail: this.getQueueItems()
    }))
  }

  async loadQueueState(): Promise<void> {
    const { data, error } = await this.supabase
      .from('download_queue')
      .select('queue_state')
      .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id)
      .single()

    if (error) {
      console.error('Failed to load queue state:', error)
      return
    }

    if (data?.queue_state) {
      this.queue = new Map(data.queue_state)
      this.processQueue()
    }
  }
}

export const downloadQueueManager = DownloadQueueManager.getInstance() 