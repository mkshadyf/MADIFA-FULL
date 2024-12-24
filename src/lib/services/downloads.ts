import type { Content } from '@/types'
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
  private queue: Map<string, Content> = new Map()
  private storageUsage: number = 0
  private storageQuota: number = 0

  constructor() {
    super()
  }

  // Queue management
  addToQueue(content: Content) {
    this.queue.set(content.id, content)
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

  getQueueStatus(): { queued: Content[]; downloading: Content[]; completed: Content[] } {
    const queued = Array.from(this.queue.values())
    const downloading = queued.filter(content => this.progress.has(content.id))
    const completed = Array.from(this.downloads.values())
    return { queued, downloading, completed }
  }

  clearQueue() {
    this.queue.clear()
    this.emit('queueCleared')
  }

  getDownloadedFiles(): Content[] {
    return Array.from(this.downloads.values())
  }

  getDownloadedContent(): Content[] {
    return Array.from(this.downloads.values())
  }

  getStorageUsage(): { used: number; total: number } {
    return {
      used: this.storageUsage,
      total: this.storageQuota
    }
  }

  // Original methods
  addDownload(content: Content) {
    this.downloads.set(content.id, content)
    this.emit('downloadAdded', content)
  }

  removeDownload(contentId: string) {
    const content = this.downloads.get(contentId)
    if (content) {
      this.downloads.delete(contentId)
      this.progress.delete(contentId)
      this.emit('downloadRemoved', content)
    }
  }

  updateProgress(contentId: string, bytesLoaded: number, bytesTotal: number) {
    const progress: DownloadProgress = {
      contentId,
      bytesLoaded,
      bytesTotal,
      percent: (bytesLoaded / bytesTotal) * 100
    }
    this.progress.set(contentId, progress)
    this.emit('progress', progress)
  }

  completeDownload(contentId: string) {
    const content = this.downloads.get(contentId)
    if (content) {
      this.emit('complete', content)
    }
  }

  errorDownload(contentId: string, error: Error) {
    const downloadError: DownloadError = { contentId, error }
    this.emit('error', downloadError)
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
  getStorageUsage
} = downloadsManager
