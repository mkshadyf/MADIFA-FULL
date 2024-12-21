import React, { useEffect, useState } from 'react'
import type { Content } from '@/types'
import { Link } from 'react-router-dom'

import { downloadsManager } from '@/lib/services/downloads'
import { formatBytes } from '@/lib/utils/format'
import { useToast } from '@/hooks/useToast'
import { IconButton } from '@/components/ui/button'


export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Content[]>([])
  const [storageInfo, setStorageInfo] = useState<{
    used: number
    quota: number
    percentage: number
  }>({ used: 0, quota: 0, percentage: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    loadDownloads()
  }, [])

  async function loadDownloads() {
    try {
      const [downloadedContent, storage] = await Promise.all([
        downloadsManager.getDownloadedContent(),
        downloadsManager.getStorageUsage(),
      ])
      setDownloads(downloadedContent)
      setStorageInfo(storage)
    } catch (error) {
      console.error('Failed to load downloads:', error)
      showToast('Failed to load downloads', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveDownload(contentId: string) {
    try {
      await downloadsManager.removeDownload(contentId)
      setDownloads(downloads.filter(d => d.id !== contentId))
      showToast('Download removed successfully', 'success')
    } catch (error) {
      console.error('Failed to remove download:', error)
      showToast('Failed to remove download', 'error')
    }
  }

  async function handleClearDownloads() {
    if (!confirm('Are you sure you want to remove all downloads?')) return

    try {
      await downloadsManager.clearDownloads()
      setDownloads([])
      showToast('All downloads cleared successfully', 'success')
    } catch (error) {
      console.error('Failed to clear downloads:', error)
      showToast('Failed to clear downloads', 'error')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Downloads</h1>
        {downloads.length > 0 && (
          <button
            onClick={handleClearDownloads}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Storage usage */}
      <div className="mb-8 rounded-lg bg-gray-800 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-gray-400">Storage Usage</span>
          <span className="text-white">
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-700">
          <div
            className="h-2 rounded-full bg-indigo-600"
            style={{ width: `${storageInfo.percentage}%` }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-indigo-500" />
        </div>
      ) : downloads.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-gray-400">No downloaded content</p>
          <Link
            to="/browse"
            className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Browse Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {downloads.map(content => (
            <div
              key={content.id}
              className="overflow-hidden rounded-lg bg-gray-800"
            >
              <Link to={`/watch/${content.id}?source=local`}>
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="aspect-video w-full object-cover"
                />
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-lg font-semibold text-white">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {content.description?.slice(0, 100)}
                      {content.description?.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <IconButton
                    label="Remove download"
                    icon="trash"
                    onClick={() => handleRemoveDownload(content.id)}
                    className="text-gray-400 hover:text-red-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
