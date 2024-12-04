import React, { useState } from 'react'
import { useContent } from '@/hooks/useContent'
import { IconButton } from '@/components/ui/button'
import type { Content } from '@/types'
import { contentManager } from '@/lib/services/content-manager'
import { useToast } from '@/hooks/useToast'

interface ContentBatchOperationsProps {
  className?: string
  onBatchComplete?: () => void
}

export default function ContentBatchOperations({
  className = '',
  onBatchComplete
}: ContentBatchOperationsProps) {
  const { data: contents } = useContent()
  const { showToast } = useToast()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [operation, setOperation] = useState<'tag' | 'categorize' | 'delete' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [newValue, setNewValue] = useState('')

  const handleSelect = (contentId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId)
    } else {
      newSelected.add(contentId)
    }
    setSelectedItems(newSelected)
  }

  const handleBatchOperation = async () => {
    if (!operation || isProcessing || !selectedItems.size) return

    setIsProcessing(true)
    try {
      const selectedContent = contents?.filter((c: Content) => selectedItems.has(c.id)) || []

      switch (operation) {
        case 'tag':
          await handleTagOperation(selectedContent)
          break
        case 'categorize':
          await handleCategorizeOperation(selectedContent)
          break
        case 'delete':
          await handleDeleteOperation(selectedContent)
          break
      }

      onBatchComplete?.()
      setSelectedItems(new Set())
      setOperation(null)
      setNewValue('')
      showToast('Batch operation completed successfully', 'success')
    } catch (error) {
      console.error('Batch operation failed:', error)
      showToast('Failed to complete batch operation', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTagOperation = async (selectedContent: Content[]) => {
    await Promise.all(
      selectedContent.map(content =>
        contentManager.updateMetadata(content.id, {
          tags: [...(content.tags || []), newValue]
        })
      )
    )
  }

  const handleCategorizeOperation = async (selectedContent: Content[]) => {
    await Promise.all(
      selectedContent.map(content =>
        contentManager.updateMetadata(content.id, {
          category: newValue
        })
      )
    )
  }

  const handleDeleteOperation = async (selectedContent: Content[]) => {
    await Promise.all(
      selectedContent.map(content => contentManager.deleteContent(content.id))
    )
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Batch Operations</h3>
        <IconButton
          icon="check"
          onClick={handleBatchOperation}
          disabled={!operation || isProcessing || !selectedItems.size}
          className={isProcessing ? 'animate-spin' : ''}
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setOperation('tag')}
            className={`p-2 rounded-lg border ${
              operation === 'tag'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            Add Tags
          </button>
          <button
            onClick={() => setOperation('categorize')}
            className={`p-2 rounded-lg border ${
              operation === 'categorize'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            Categorize
          </button>
          <button
            onClick={() => setOperation('delete')}
            className={`p-2 rounded-lg border ${
              operation === 'delete'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            Delete
          </button>
        </div>

        {operation && operation !== 'delete' && (
          <input
            type="text"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder={operation === 'tag' ? 'Enter tags...' : 'Enter category...'}
            className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
          />
        )}

        <div className="text-sm text-gray-400">
          {selectedItems.size} items selected
        </div>

        <div className="max-h-48 overflow-y-auto">
          {contents?.map(content => (
            <div
              key={content.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-800 rounded-lg"
            >
              <input
                type="checkbox"
                checked={selectedItems.has(content.id)}
                onChange={() => handleSelect(content.id)}
                className="rounded border-gray-700 bg-gray-800"
              />
              <span className="text-gray-300">{content.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 