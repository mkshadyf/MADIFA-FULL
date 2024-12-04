import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '../ui/ProgressBar'
import { useQueueStore } from '@/stores/queueStore'

interface DownloadProgressProps {
  contentId: string
}

export default function DownloadProgress({ contentId }: DownloadProgressProps) {
  const { queue } = useQueueStore()
  const item = queue.get(contentId)

  if (!item || item.status === 'completed') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">
            {item.status === 'error' ? 'Download Failed' : 'Downloading...'}
          </h3>
          <span className="text-xs text-gray-500">
            {item.status === 'downloading' ? `${Math.round(item.progress)}%` : ''}
          </span>
        </div>

        {item.status === 'downloading' && (
          <ProgressBar
            progress={item.progress}
            showPercentage={false}
            height={2}
            color="bg-indigo-600"
            backgroundColor="bg-gray-100"
          />
        )}

        {item.status === 'error' && (
          <div className="text-sm text-red-600">{item.error}</div>
        )}

        <div className="mt-2 flex justify-end space-x-2">
          {item.status === 'error' && (
            <button
              onClick={() => useQueueStore.getState().retryDownload(contentId)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Retry
            </button>
          )}
          <button
            onClick={() => useQueueStore.getState().removeFromQueue(contentId)}
            className="text-sm text-gray-600 hover:text-gray-500"
          >
            {item.status === 'error' ? 'Dismiss' : 'Cancel'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
} 