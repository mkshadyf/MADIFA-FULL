import React from 'react'
import type { Content } from '@/types'

import { formatBytes } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useStorageQuota } from '@/hooks/useStorageQuota'

import QuotaAwareDownloadButton from '../downloads/QuotaAwareDownloadButton'

interface QuotaAwareContentGridProps {
  contents: Content[]
  className?: string
}

export default function QuotaAwareContentGrid({
  contents,
  className = '',
}: QuotaAwareContentGridProps) {
  const { quotaStats } = useStorageQuota()
  const { queueItems } = useDownloadQueue()

  const isQueued = (contentId: string) => {
    return queueItems.some(item => item.content.id === contentId)
  }

  const getTotalQueueSize = () => {
    return queueItems.reduce(
      (total, item) => total + (item.content.size || 0),
      0
    )
  }

  const getEstimatedStorageAfterQueue = () => {
    return quotaStats.used + getTotalQueueSize()
  }

  return (
    <div className={className}>
      {quotaStats.isNearLimit ? (
        <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <h4 className="mb-2 font-medium text-yellow-500">
            Storage Space Running Low
          </h4>
          <div className="text-sm text-yellow-500/80">
            <p>
              Current usage: {formatBytes(quotaStats.used)} /{' '}
              {formatBytes(quotaStats.quota)}
            </p>
            <p>Queued downloads: {formatBytes(getTotalQueueSize())}</p>
            <p>
              Estimated after queue:{' '}
              {formatBytes(getEstimatedStorageAfterQueue())}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {contents.map(content => (
          <div
            key={content.id}
            className="group relative overflow-hidden rounded-lg bg-gray-900"
          >
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="aspect-video w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div>
                  <h3 className="font-medium text-white">{content.title}</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    {content.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    {formatBytes(content.size || 0)}
                  </span>

                  <QuotaAwareDownloadButton
                    content={content}
                    className={
                      isQueued(content.id)
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                    }
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
