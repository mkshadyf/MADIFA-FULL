import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types'
import { DBSchema, IDBPDatabase, openDB } from 'idb'

interface DownloadsDB extends DBSchema {
  downloads: {
    key: string
    value: {
      content: Content
      videoBlob: Blob
      thumbnailBlob: Blob
      downloadedAt: number
    }
  }
}

class DownloadsManager {
  private static instance: DownloadsManager
  private db: IDBPDatabase<DownloadsDB> | null = null
  private supabase = createClient()

  static getInstance(): DownloadsManager {
    if (!DownloadsManager.instance) {
      DownloadsManager.instance = new DownloadsManager()
    }
    return DownloadsManager.instance
  }

  private async initDB() {
    if (!this.db) {
      this.db = await openDB<DownloadsDB>('madifa-downloads', 1, {
        upgrade(db) {
          db.createObjectStore('downloads')
        }
      })
    }
    return this.db
  }

  async downloadContent(contentId: string): Promise<void> {
    const db = await this.initDB()

    // Check if already downloaded
    const existing = await db.get('downloads', contentId)
    if (existing) return

    // Get content metadata
    const { data: content, error } = await this.supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single()

    if (error || !content) throw new Error('Content not found')

    // Download video and thumbnail
    const [videoBlob, thumbnailBlob] = await Promise.all([
      this.downloadVideo(content.video_url),
      this.downloadThumbnail(content.thumbnail_url)
    ])

    // Store everything
    await db.put('downloads', {
      content,
      videoBlob,
      thumbnailBlob,
      downloadedAt: Date.now()
    }, contentId)
  }

  async getDownloadedContent(): Promise<Content[]> {
    const db = await this.initDB()
    const downloads = await db.getAll('downloads')
    return downloads.map(d => d.content)
  }

  async getDownloadedVideo(contentId: string): Promise<Blob | null> {
    const db = await this.initDB()
    const download = await db.get('downloads', contentId)
    return download?.videoBlob || null
  }

  async removeDownload(contentId: string): Promise<void> {
    const db = await this.initDB()
    await db.delete('downloads', contentId)
  }

  async clearDownloads(): Promise<void> {
    const db = await this.initDB()
    await db.clear('downloads')
  }

  private async downloadVideo(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to download video')
    return response.blob()
  }

  private async downloadThumbnail(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to download thumbnail')
    return response.blob()
  }

  async getStorageUsage(): Promise<{
    used: number
    quota: number
    percentage: number
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate()
      return {
        used: usage || 0,
        quota: quota || 0,
        percentage: ((usage || 0) / (quota || 1)) * 100
      }
    }
    return { used: 0, quota: 0, percentage: 0 }
  }
}

export const downloadsManager = DownloadsManager.getInstance() 