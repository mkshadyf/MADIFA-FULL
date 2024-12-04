import React from 'react'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useQuotaEnforcement } from '@/hooks/useQuotaEnforcement'
import { useStorageQuota } from '@/hooks/useStorageQuota'
import { IconButton } from '../ui/button'
import DownloadProgress from './DownloadProgress'
import StorageQuotaIndicator from './StorageQuotaIndicator'
import { formatBytes } from '@/lib/utils/format'

export default function QuotaAwareDownloadQueue() {
  const { 
    queueItems, 
    removeFromQueue, 
    pauseDownload, 
    resumeDownload, 
    clearQueue 
  } = useDownloadQueue()
  const { quotaStats } = useStorageQuota()
  const { startQuotaMonitoring, stopQuotaMonitoring } = useQuotaEnforcement()

  if (queueItems.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 w-96 max-h-[70vh] bg-gray-900 rounded-tl-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Downloads</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {queueItems.length} item{queueItems.length !== 1 ? 's' : ''}
            </span>
            <IconButton
              icon="x"
              onClick={clearQueue}
              className="text-gray-400 hover:text-white"
            />
          </div>
        </div>

        <StorageQuotaIndicator showDetails={quotaStats.isNearLimit} />
      </div>

      <div className="overflow-y-auto max-h-[calc(70vh-8rem)]">
        {queueItems.map(item => (
          <div 
            key={item.id} 
            className="p-4 border-b border-gray-800"
            onMouseEnter={() => startQuotaMonitoring(item.id)}
            onMouseLeave={stopQuotaMonitoring}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="text-sm font-medium text-white truncate">
                  {item.content.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {formatBytes(item.content.size || 0)}
                </p>
              </div>
              <IconButton
                icon="trash"
                onClick={() => removeFromQueue(item.id)}
                className="text-gray-400 hover:text-red-500"
              />
            </div>

            <DownloadProgress
              progress={item.progress}
              downloaded={item.progress * (item.content.size || 0) / 100}
              total={item.content.size || 0}
              status={item.status}
              error={item.error}
              onPause={
                item.status === 'downloading' 
                  ? () => pauseDownload(item.id)
                  : undefined
              }
              onResume={
                item.status === 'paused'
                  ? () => resumeDownload(item.id)
                  : undefined
              }
              onCancel={() => removeFromQueue(item.id)}
            />

            {quotaStats.isNearLimit && (
              <p className="text-xs text-yellow-500 mt-2">
                Storage space is running low. This download may be paused if space runs out.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 