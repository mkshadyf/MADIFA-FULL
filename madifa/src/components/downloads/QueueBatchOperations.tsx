import React, { useState } from 'react'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import { useQuotaAwareQueue } from '@/hooks/useQuotaAwareQueue'
import { IconButton } from '../ui/button'
import { formatBytes } from '@/lib/utils/format'

interface QueueBatchOperationsProps {
  className?: string
  onBatchComplete?: () => void
}

export default function QueueBatchOperations({
  className = '',
  onBatchComplete
}: QueueBatchOperationsProps) {
  const { queueStats } = useQuotaAwareQueue()
  const { optimizeQueue, isOptimizing } = useQueuePriority()
  const [selectedOperation, setSelectedOperation] = useState<
    'pause' | 'resume' | 'remove' | 'prioritize' | null
  >(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  const handleBatchOperation = async () => {
    if (!selectedOperation || isProcessing) return

    setIsProcessing(true)
    try {
      switch (selectedOperation) {
        case 'pause':
          // Implement batch pause
          break
        case 'resume':
          // Implement batch resume
          break
        case 'remove':
          // Implement batch remove
          break
        case 'prioritize':
          await optimizeQueue()
          break
      }
      onBatchComplete?.()
    } catch (error) {
      console.error('Failed to perform batch operation:', error)
    } finally {
      setIsProcessing(false)
      setSelectedOperation(null)
      setSelectedItems(new Set())
    }
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Batch Operations</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {selectedItems.size} selected
          </span>
          <IconButton
            icon="check"
            onClick={handleBatchOperation}
            disabled={!selectedOperation || isProcessing}
            className={`${isProcessing ? 'animate-spin' : ''}`}
            aria-label="Apply batch operation"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={() => setSelectedOperation('pause')}
          className={`p-3 rounded-lg border ${
            selectedOperation === 'pause'
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">Pause All</span>
        </button>
        <button
          onClick={() => setSelectedOperation('resume')}
          className={`p-3 rounded-lg border ${
            selectedOperation === 'resume'
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">Resume All</span>
        </button>
        <button
          onClick={() => setSelectedOperation('remove')}
          className={`p-3 rounded-lg border ${
            selectedOperation === 'remove'
              ? 'border-red-500 bg-red-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">Remove Selected</span>
        </button>
        <button
          onClick={() => setSelectedOperation('prioritize')}
          className={`p-3 rounded-lg border ${
            selectedOperation === 'prioritize'
              ? 'border-green-500 bg-green-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">Optimize Queue</span>
        </button>
      </div>

      <div className="text-sm text-gray-400">
        <p>Total Size: {formatBytes(queueStats.totalSize)}</p>
        <p>Items: {queueStats.itemCount}</p>
        {selectedItems.size > 0 && (
          <p className="text-indigo-400 mt-2">
            {selectedItems.size} items selected for {selectedOperation}
          </p>
        )}
      </div>
    </div>
  )
} 