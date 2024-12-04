import React, { useEffect, useState } from 'react'
import { downloadsManager } from '@/lib/services/downloads'
import type { Content } from '@/types'
import { formatBytes } from '@/lib/utils/format'
import { Link } from 'react-router-dom'
import { IconButton } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

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
        downloadsManager.getStorageUsage()
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Downloads</h1>
        {downloads.length > 0 && (
          <button
            onClick={handleClearDownloads}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Storage usage */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Storage Usage</span>
          <span className="text-white">
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.quota)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${storageInfo.percentage}%` }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
        </div>
      ) : downloads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No downloaded content</p>
          <Link
            to="/browse"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            Browse Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map(content => (
            <div
              key={content.id}
              className="bg-gray-800 rounded-lg overflow-hidden"
            >
              <Link to={`/watch/${content.id}?source=local`}>
                <img
                  src={content.thumbnail_url}
                  alt={content.title}
                  className="w-full aspect-video object-cover"
                />
              </Link>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {content.description.slice(0, 100)}
                      {content.description.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <IconButton
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