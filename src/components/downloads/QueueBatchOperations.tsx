import React, { useState } from 'react'

import { formatBytes } from '@/lib/utils/format'
import { useQueuePriority } from '@/hooks/useQueuePriority'
import { useQuotaAwareQueue } from '@/hooks/useQuotaAwareQueue'

import { IconButton } from '../ui/button'

interface QueueBatchOperationsProps {
  className?: string
  onBatchComplete?: () => void
}

export default function QueueBatchOperations({
  className = '',
  onBatchComplete,
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
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Batch Operations</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {selectedItems.size} selected
          </span>
          <IconButton
            label="Apply batch operation"
            icon="check"
            onClick={handleBatchOperation}
            disabled={!selectedOperation || isProcessing}
            className={`${isProcessing ? 'animate-spin' : ''}`}
            aria-label="Apply batch operation"
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedOperation('pause')}
          className={`rounded-lg border p-3 ${
            selectedOperation === 'pause'
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">Pause All</span>
        </button>
        <button
          onClick={() => setSelectedOperation('resume')}
          className={`rounded-lg border p-3 ${
            selectedOperation === 'resume'
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">Resume All</span>
        </button>
        <button
          onClick={() => setSelectedOperation('remove')}
          className={`rounded-lg border p-3 ${
            selectedOperation === 'remove'
              ? 'border-red-500 bg-red-500/10'
              : 'border-gray-700 hover:border-gray-600'
          }`}
        >
          <span className="text-sm font-medium text-white">
            Remove Selected
          </span>
        </button>
        <button
          onClick={() => setSelectedOperation('prioritize')}
          className={`rounded-lg border p-3 ${
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
          <p className="mt-2 text-indigo-400">
            {selectedItems.size} items selected for {selectedOperation}
          </p>
        )}
      </div>
    </div>
  )
}
