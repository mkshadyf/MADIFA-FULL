import React from 'react'

import { formatBytes } from '@/lib/utils/format'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'

import { IconButton } from '../ui/button'
import DownloadProgress from './DownloadProgress'

export default function DownloadQueue() {
  const {
    queueItems,
    removeFromQueue,
    pauseDownload,
    resumeDownload,
    clearQueue,
  } = useDownloadQueue()

  if (queueItems.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 max-h-[70vh] w-96 overflow-hidden rounded-tl-lg bg-gray-900 shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
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

      <div className="max-h-[calc(70vh-4rem)] overflow-y-auto">
        {queueItems.map(item => (
          <div key={item.id} className="border-b border-gray-800 p-4">
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
                icon="trash"
                onClick={() => removeFromQueue(item.id)}
                className="text-gray-400 hover:text-red-500"
              />
            </div>

            <DownloadProgress
              progress={item.progress}
              downloaded={(item.progress * (item.content.size || 0)) / 100}
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
