import React from 'react'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { formatBytes } from '@/lib/utils/format'
import { IconButton } from '../ui/button'
import DownloadProgress from './DownloadProgress'

export default function DownloadQueue() {
  const { 
    queueItems, 
    removeFromQueue, 
    pauseDownload, 
    resumeDownload, 
    clearQueue 
  } = useDownloadQueue()

  if (queueItems.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 w-96 max-h-[70vh] bg-gray-900 rounded-tl-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
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

      <div className="overflow-y-auto max-h-[calc(70vh-4rem)]">
        {queueItems.map(item => (
          <div key={item.id} className="p-4 border-b border-gray-800">
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
          </div>
        ))}
      </div>
    </div>
  )
} 