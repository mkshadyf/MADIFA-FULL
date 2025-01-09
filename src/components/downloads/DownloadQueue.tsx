import { DownloadProgress } from './DownloadProgress'

interface DownloadQueueProps {
  items: Array<{
    id: string
    progress: number
    status: 'pending' | 'downloading' | 'completed' | 'error'
  }>
  onClearQueue?: () => void
  onRemoveItem?: (id: string) => void
}

export function DownloadQueue({ items, onClearQueue, onRemoveItem }: DownloadQueueProps) {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No downloads in queue
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">Download Queue</h2>
        {onClearQueue && (
          <button
            onClick={onClearQueue}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            Clear Queue
          </button>
        )}
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="relative">
            <DownloadProgress
              contentId={item.id}
              progress={item.progress}
              status={item.status}
            />
            {onRemoveItem && (
              <button
                onClick={() => onRemoveItem(item.id)}
                className="absolute right-2 top-2 text-sm text-gray-600 hover:text-gray-500"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
