import { useCallback, useEffect, useState } from 'react'
import type { Content } from '@/types'

import { downloadsManager } from '@/lib/services/downloads'

import { useToast } from './useToast'

interface DownloadProgress {
  [key: string]: {
    progress: number
    downloaded: number
    total: number
    status: 'downloading' | 'paused' | 'completed' | 'error'
    error?: string
  }
}

export function useDownloads() {
  const [downloads, setDownloads] = useState<Content[]>([])
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({})
  const [storageInfo, setStorageInfo] = useState<{
    used: number
    quota: number
    percentage: number
  }>({ used: 0, quota: 0, percentage: 0 })
  const { showToast } = useToast()

  const loadDownloads = useCallback(async () => {
    try {
      const [downloadedContent, storage] = await Promise.all([
        downloadsManager.getDownloadedContent(),
        downloadsManager.getStorageUsage(),
      ])
      setDownloads(downloadedContent)
      setStorageInfo(storage)
    } catch (error) {
      logger.error('Failed to load downloads:', error)
      showToast('Failed to load downloads', 'error')
    }
  }, [showToast])

  const startDownload = useCallback(
    async (content: Content) => {
      try {
        // Initialize progress state
        setDownloadProgress(prev => ({
          ...prev,
          [content.id]: {
            progress: 0,
            downloaded: 0,
            total: 0,
            status: 'downloading',
          },
        }))

        // Start download with progress tracking
        await downloadsManager.downloadContent(content.id, {
          onProgress: (downloaded, total) => {
            const progress = (downloaded / total) * 100
            setDownloadProgress(prev => ({
              ...prev,
              [content.id]: {
                progress,
                downloaded,
                total,
                status: 'downloading',
              },
            }))
          },
        })

        // Update downloads list
        await loadDownloads()

        setDownloadProgress(prev => ({
          ...prev,
          [content.id]: {
            ...prev[content.id],
            status: 'completed',
          },
        }))

        showToast('Download completed successfully', 'success')
      } catch (error) {
        logger.error('Failed to download content:', error)
        setDownloadProgress(prev => ({
          ...prev,
          [content.id]: {
            ...prev[content.id],
            status: 'error',
            error: 'Download failed',
          },
        }))
        showToast('Failed to download content', 'error')
      }
    },
    [loadDownloads, showToast]
  )

  const removeDownload = useCallback(
    async (contentId: string) => {
      try {
        await downloadsManager.removeDownload(contentId)
        setDownloads(prev => prev.filter(d => d.id !== contentId))
        showToast('Download removed successfully', 'success')
      } catch (error) {
        logger.error('Failed to remove download:', error)
        showToast('Failed to remove download', 'error')
      }
    },
    [showToast]
  )

  const clearDownloads = useCallback(async () => {
    try {
      await downloadsManager.clearDownloads()
      setDownloads([])
      showToast('All downloads cleared successfully', 'success')
    } catch (error) {
      logger.error('Failed to clear downloads:', error)
      showToast('Failed to clear downloads', 'error')
    }
  }, [showToast])

  useEffect(() => {
    loadDownloads()
  }, [loadDownloads])

  return {
    downloads,
    downloadProgress,
    storageInfo,
    startDownload,
    removeDownload,
    clearDownloads,
    refreshDownloads: loadDownloads,
  }
}
