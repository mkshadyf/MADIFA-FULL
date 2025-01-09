import type { Content } from '@/types'
import type { DownloadStatus } from '@/types/downloads'
import { EventEmitter } from 'events'

export interface DownloadProgress {
  contentId: string
  bytesLoaded: number
  bytesTotal: number
  percent: number
}

export interface DownloadError {
  contentId: string
  error: Error
}

export class DownloadsManager extends EventEmitter {
  private downloads: Map<string, Content> = new Map()
  private progress: Map<string, DownloadProgress> = new Map()
  private queue: Map<string, { content: Content; status: DownloadStatus }> =
    new Map()
  private storageQuota: number = 0

  constructor() {
    super()
  }

  // Queue management
  addToQueue(content: Content) {
    this.queue.set(content.id, { content, status: 'queued' })
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  removeFromQueue(contentId: string) {
    this.queue.delete(contentId)
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  pauseDownload(contentId: string) {
    const content = this.queue.get(contentId)
    if (content) {
      this.emit('downloadPaused', content)
    }
  }

  resumeDownload(contentId: string) {
    const content = this.queue.get(contentId)
    if (content) {
      this.emit('downloadResumed', content)
    }
  }

  cancelDownload(contentId: string) {
    this.removeFromQueue(contentId)
    this.emit('downloadCancelled', contentId)
  }

  getDownloadProgress(contentId: string): number {
    const progress = this.progress.get(contentId)
    return progress ? progress.percent : 0
  }

  getQueueStatus(): {
    queued: Content[]
    downloading: Content[]
    completed: Content[]
    failed: Content[]
  } {
    const items = Array.from(this.queue.values())
    return {
      queued: items
        .filter(item => item.status === 'queued')
        .map(item => item.content),
      downloading: items
        .filter(item => item.status === 'downloading')
        .map(item => item.content),
      completed: items
        .filter(item => item.status === 'completed')
        .map(item => item.content),
      failed: items
        .filter(item => item.status === 'failed')
        .map(item => item.content),
    }
  }

  clearQueue() {
    this.queue.clear()
    this.progress.clear()
    this.emit('queueCleared')
    this.emit('queueUpdated', [])
  }

  getDownloadedFiles(): Content[] {
    const items = Array.from(this.queue.values())
    return items
      .filter(item => item.status === 'completed')
      .map(item => item.content)
  }

  getDownloadedContent(): Content[] {
    return this.getDownloadedFiles()
  }

  getStorageUsage(): { used: number; total: number } {
    const completedDownloads = Array.from(this.queue.values())
      .filter(item => item.status === 'completed')
      .map(item => item.content)

    const used = completedDownloads.reduce(
      (sum, content) => sum + (content.size || 0),
      0
    )
    return {
      used,
      total: this.storageQuota,
    }
  }

  // Original methods
  addDownload(content: Content) {
    const item = { content, status: 'queued' as const }
    this.queue.set(content.id, item)
    this.emit('downloadAdded', content)
    this.emit('queueUpdated', Array.from(this.queue.values()))
  }

  removeDownload(contentId: string) {
    const item = this.queue.get(contentId)
    if (item) {
      this.queue.delete(contentId)
      this.downloads.delete(contentId)
      this.progress.delete(contentId)
      this.emit('downloadRemoved', item.content)
      this.emit('queueUpdated', Array.from(this.queue.values()))
    }
  }

  updateProgress(contentId: string, bytesLoaded: number, bytesTotal: number) {
    const item = this.queue.get(contentId)
    if (item) {
      item.status = 'downloading'
      const progress: DownloadProgress = {
        contentId,
        bytesLoaded,
        bytesTotal,
        percent: (bytesLoaded / bytesTotal) * 100,
      }
      this.progress.set(contentId, progress)
      this.emit('progress', progress)
      this.emit('queueUpdated', Array.from(this.queue.values()))
    }
  }

  completeDownload(contentId: string) {
    const item = this.queue.get(contentId)
    if (item) {
      item.status = 'completed'
      this.downloads.set(contentId, item.content)
      this.emit('complete', item.content)
      this.emit('queueUpdated', Array.from(this.queue.values()))
    }
  }

  errorDownload(contentId: string, error: Error) {
    const item = this.queue.get(contentId)
    if (item) {
      item.status = 'failed'
      const downloadError: DownloadError = { contentId, error }
      this.emit('error', downloadError)
      this.emit('queueUpdated', Array.from(this.queue.values()))
    }
  }

  getDownloads(): Content[] {
    return Array.from(this.downloads.values())
  }

  getProgress(contentId: string): DownloadProgress | undefined {
    return this.progress.get(contentId)
  }

  clearDownloads() {
    this.downloads.clear()
    this.progress.clear()
    this.emit('cleared')
  }
}

// Create and export singleton instance
export const downloadsManager = new DownloadsManager()

// Export individual functions for convenience
export const {
  addToQueue,
  removeFromQueue,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  getDownloadProgress,
  getQueueStatus,
  clearQueue,
  getDownloadedFiles,
  getDownloadedContent,
  getStorageUsage,
} = downloadsManager
