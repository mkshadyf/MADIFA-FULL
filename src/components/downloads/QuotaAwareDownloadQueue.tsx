import React from 'react'

import { formatBytes } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useQuotaEnforcement } from '@/hooks/useQuotaEnforcement'
import { useStorageQuota } from '@/hooks/useStorageQuota'

import { IconButton } from '../ui/button'
import DownloadProgress from './DownloadProgress'
import StorageQuotaIndicator from './StorageQuotaIndicator'

export default function QuotaAwareDownloadQueue() {
  const {
    queueItems,
    removeFromQueue,
    pauseDownload,
    resumeDownload,
    clearQueue,
  } = useDownloadQueue()
  const { quotaStats } = useStorageQuota()
  const { startQuotaMonitoring, stopQuotaMonitoring } = useQuotaEnforcement()

  if (queueItems.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 max-h-[70vh] w-96 overflow-hidden rounded-tl-lg bg-gray-900 shadow-xl">
      <div className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Downloads</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {queueItems.length} item{queueItems.length !== 1 ? 's' : ''}
            </span>
            <IconButton
              label="Clear"
              icon="x"
              onClick={clearQueue}
              className="text-gray-400 hover:text-white"
            />
          </div>
        </div>

        <StorageQuotaIndicator showDetails={quotaStats.isNearLimit} />
      </div>

      <div className="max-h-[calc(70vh-8rem)] overflow-y-auto">
        {queueItems.map(item => (
          <div
            key={item.id}
            className="border-b border-gray-800 p-4"
            onMouseEnter={() => startQuotaMonitoring(item.id)}
            onMouseLeave={stopQuotaMonitoring}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="mr-4 min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-white">
                  {item.content.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {formatBytes(item.content.size || 0)}
                </p>
              </div>
              <IconButton
                label="Remove"
                icon="trash"
                onClick={() => removeFromQueue(item.id)}
                className="text-gray-400 hover:text-red-500"
              />
            </div>

            <DownloadProgress contentId={item.id} />

            {quotaStats.isNearLimit ? (
              <p className="mt-2 text-xs text-yellow-500">
                Storage space is running low. This download may be paused if
                space runs out.
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
