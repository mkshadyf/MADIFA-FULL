import React from 'react'
import { useStorageQuota } from '@/hooks/useStorageQuota'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import type { Content } from '@/types'
import QuotaAwareDownloadButton from '../downloads/QuotaAwareDownloadButton'
import { formatBytes } from '@/lib/utils/format'

interface QuotaAwareContentGridProps {
  contents: Content[]
  className?: string
}

export default function QuotaAwareContentGrid({
  contents,
  className = ''
}: QuotaAwareContentGridProps) {
  const { quotaStats } = useStorageQuota()
  const { queueItems } = useDownloadQueue()

  const isQueued = (contentId: string) => {
    return queueItems.some(item => item.content.id === contentId)
  }

  const getTotalQueueSize = () => {
    return queueItems.reduce((total, item) => total + (item.content.size || 0), 0)
  }

  const getEstimatedStorageAfterQueue = () => {
    return quotaStats.used + getTotalQueueSize()
  }

  return (
    <div className={className}>
      {quotaStats.isNearLimit && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h4 className="text-yellow-500 font-medium mb-2">Storage Space Running Low</h4>
          <div className="text-sm text-yellow-500/80">
            <p>Current usage: {formatBytes(quotaStats.used)} / {formatBytes(quotaStats.quota)}</p>
            <p>Queued downloads: {formatBytes(getTotalQueueSize())}</p>
            <p>Estimated after queue: {formatBytes(getEstimatedStorageAfterQueue())}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contents.map(content => (
          <div 
            key={content.id}
            className="relative group bg-gray-900 rounded-lg overflow-hidden"
          >
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full aspect-video object-cover"
            />

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-medium">{content.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {content.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {formatBytes(content.size || 0)}
                  </span>

                  <QuotaAwareDownloadButton
                    content={content}
                    className={isQueued(content.id) ? 'opacity-50 cursor-not-allowed' : ''}
                    onQuotaExceeded={() => {
                      // Handle quota exceeded
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 