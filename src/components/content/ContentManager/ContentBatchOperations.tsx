import { IconButton } from '@/components/ui'
import {
  batchDeleteContent,
  batchUpdateContent,
} from '@/lib/services/content-manager'
import type { Content, ContentStatus } from '@/types/content'
import { useState } from 'react'

interface ContentBatchOperationsProps {
  selectedItems: Content[]
  onOperationComplete: () => void
}

export function ContentBatchOperations({
  selectedItems,
  onOperationComplete,
}: ContentBatchOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStatusUpdate = async (status: ContentStatus) => {
    if (!selectedItems.length || isProcessing) return

    setIsProcessing(true)
    try {
      await batchUpdateContent(
        selectedItems.map(item => item.id),
        { status }
      )
      onOperationComplete()
    } catch (error) {
      console.error('Failed to update content status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItems.length || isProcessing) return

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} items?`
    )
    if (!confirmed) return

    setIsProcessing(true)
    try {
      await batchDeleteContent(selectedItems.map(item => item.id))
      onOperationComplete()
    } catch (error) {
      console.error('Failed to delete content:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!selectedItems.length) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center space-x-2 rounded-lg bg-gray-800 p-4 shadow-lg">
      <span className="mr-4 text-sm text-gray-300">
        {selectedItems.length} items selected
      </span>

      <IconButton
        icon="archive"
        label="Archive selected items"
        onClick={() => handleStatusUpdate('archived')}
        disabled={isProcessing}
      />

      <IconButton
        icon="publish"
        label="Publish selected items"
        onClick={() => handleStatusUpdate('published')}
        disabled={isProcessing}
      />

      <IconButton
        icon="draft"
        label="Move to draft"
        onClick={() => handleStatusUpdate('draft')}
        disabled={isProcessing}
      />

      <IconButton
        icon="delete"
        label="Delete selected items"
        onClick={handleDelete}
        disabled={isProcessing}
        className="text-red-500 hover:text-red-600"
      />
    </div>
  )
}
