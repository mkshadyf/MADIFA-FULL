import type { Content } from '@/types/content'
import type {
  DownloadProgress,
  QueueItem,
  StorageInfo,
} from '@/types/downloads'
import { EventEmitter } from 'events'

class DownloadService extends EventEmitter {
  private static instance: DownloadService
  private downloads: Map<string, Content> = new Map()
  private progress: Map<string, DownloadProgress> = new Map()
  private queue: Map<string, QueueItem> = new Map()
  private storageInfo: StorageInfo = {
    used: 0,
    quota: 0,
    percentage: 0,
  }

  private constructor() {
    super()
    this.initializeStorageInfo()
  }

  static getInstance(): DownloadService {
    if (!DownloadService.instance) {
      DownloadService.instance = new DownloadService()
    }
    return DownloadService.instance
  }

  // Queue Management
  async addToQueue(content: Content, priority = 0): Promise<void> {
    const queueItem: QueueItem = {
      id: content.id,
      content,
      priority,
      status: 'queued',
      progress: 0,
      addedAt: new Date().toISOString(),
    }
    this.queue.set(content.id, queueItem)
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  async removeFromQueue(contentId: string): Promise<void> {
    this.queue.delete(contentId)
    this.progress.delete(contentId)
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  async pauseDownload(contentId: string): Promise<void> {
    const item = this.queue.get(contentId)
    if (item) {
      item.status = 'paused'
      this.queue.set(contentId, item)
      this.emit('queueUpdated', Array.from(this.queue.values()))
    }
  }

  async resumeDownload(contentId: string): Promise<void> {
    const item = this.queue.get(contentId)
    if (item) {
      item.status = 'downloading'
      this.queue.set(contentId, item)
      this.emit('queueUpdated', Array.from(this.queue.values()))
    }
  }

  async clearQueue(): Promise<void> {
    this.queue.clear()
    this.progress.clear()
    this.emit('queueUpdated', [])
  }

  // Progress Management
  updateProgress(
    contentId: string,
    bytesLoaded: number,
    bytesTotal: number
  ): void {
    const progress: DownloadProgress = {
      contentId,
      bytesLoaded,
      bytesTotal,
      percent: (bytesLoaded / bytesTotal) * 100,
    }
    this.progress.set(contentId, progress)

    const item = this.queue.get(contentId)
    if (item) {
      item.progress = progress.percent
      this.queue.set(contentId, item)
    }

    this.emit('progressUpdated', progress)
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  getProgress(contentId: string): number {
    const progress = this.progress.get(contentId)
    return progress?.percent ?? 0
  }

  // Storage Management
  private async initializeStorageInfo(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        this.storageInfo = {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
          percentage: estimate.quota
            ? ((estimate.usage || 0) / estimate.quota) * 100
            : 0,
        }
        this.emit('storageUpdated', this.storageInfo)
      }
    } catch (error) {
      console.error('Failed to initialize storage info:', error)
    }
  }

  async getStorageUsage(): Promise<StorageInfo> {
    await this.initializeStorageInfo()
    return this.storageInfo
  }

  // Queue Status
  getQueue(): QueueItem[] {
    return Array.from(this.queue.values())
  }

  getQueueStatus(): {
    queued: QueueItem[]
    downloading: QueueItem[]
    completed: QueueItem[]
  } {
    const items = Array.from(this.queue.values())
    return {
      queued: items.filter(item => item.status === 'queued'),
      downloading: items.filter(item => item.status === 'downloading'),
      completed: items.filter(item => item.status === 'completed'),
    }
  }

  // Recovery and Cleanup
  async cleanupDownloads(userId: string): Promise<void> {
    // Implementation for cleanup logic
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  async recoverFailedDownloads(): Promise<void> {
    const items = Array.from(this.queue.values())
    const failedItems = items.filter(item => item.status === 'failed')
    for (const item of failedItems) {
      item.status = 'queued'
      item.progress = 0
      this.queue.set(item.id, item)
    }
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }
}

export const downloadService = DownloadService.getInstance()
