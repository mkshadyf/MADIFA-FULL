import { useState } from 'react'
import type { Content } from '@/types'

import { contentManager } from '@/lib/services/content-manager'
import { useContent } from '@/hooks/useContent'
import { useToast } from '@/hooks/useToast'
import { IconButton } from '@/components/ui/button'

interface ContentBatchOperationsProps {
  className?: string
  onBatchComplete?: () => void
}

export default function ContentBatchOperations({
  className = '',
  onBatchComplete,
}: ContentBatchOperationsProps) {
  const { data: contents } = useContent()
  const { showToast } = useToast()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [operation, setOperation] = useState<
    'tag' | 'categorize' | 'delete' | null
  >(null)
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
      const selectedContent =
        contents?.filter((c: Content) => selectedItems.has(c.id)) || []

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
          tags: [...(content.tags || []), newValue],
        })
      )
    )
  }

  const handleCategorizeOperation = async (selectedContent: Content[]) => {
    await Promise.all(
      selectedContent.map(content =>
        contentManager.updateMetadata(content.id, {
          category: newValue,
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
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Batch Operations</h3>
        <IconButton
          label="Batch Operations"
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
            className={`rounded-lg border p-2 ${
              operation === 'tag'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            Add Tags
          </button>
          <button
            onClick={() => setOperation('categorize')}
            className={`rounded-lg border p-2 ${
              operation === 'categorize'
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            Categorize
          </button>
          <button
            onClick={() => setOperation('delete')}
            className={`rounded-lg border p-2 ${
              operation === 'delete'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            Delete
          </button>
        </div>

        {operation && operation !== 'delete' ? (
          <input
            type="text"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            placeholder={
              operation === 'tag' ? 'Enter tags...' : 'Enter category...'
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
          />
        ) : null}

        <div className="text-sm text-gray-400">
          {selectedItems.size} items selected
        </div>

        <div className="max-h-48 overflow-y-auto">
          {contents?.map((content: Content) => (
            <div
              key={content.id}
              className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-800"
            >
              <input
                aria-label={content.title}
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
