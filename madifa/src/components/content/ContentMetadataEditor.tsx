import React, { useState, useEffect } from 'react'
import { useContent } from '@/hooks/useContent'
import { IconButton } from '../ui/Button'
import { contentManager } from '@/lib/services/content-manager'
import { useToast } from '@/hooks/useToast'

interface ContentMetadataEditorProps {
  className?: string
  contentId: string
  onUpdate?: () => void
}

export default function ContentMetadataEditor({
  className = '',
  contentId,
  onUpdate
}: ContentMetadataEditorProps) {
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    releaseYear: new Date().getFullYear(),
    expirationDate: '',
    availabilityWindow: 0,
    isPublic: true,
    customFields: {} as Record<string, string>
  })

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const content = await contentManager.getContent({ id: contentId })
        if (content) {
          setMetadata({
            title: content.title,
            description: content.description,
            category: content.category,
            tags: content.tags || [],
            releaseYear: content.release_year,
            expirationDate: content.expiration_date || '',
            availabilityWindow: content.availability_window || 0,
            isPublic: content.is_public ?? true,
            customFields: content.custom_fields || {}
          })
        }
      } catch (error) {
        console.error('Failed to load content metadata:', error)
        showToast('Failed to load content metadata', 'error')
      }
    }

    loadMetadata()
  }, [contentId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await contentManager.updateMetadata(contentId, metadata)
      showToast('Metadata updated successfully', 'success')
      onUpdate?.()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update metadata:', error)
      showToast('Failed to update metadata', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTagsChange = (value: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: value.split(',').map(tag => tag.trim()).filter(Boolean)
    }))
  }

  const addCustomField = () => {
    const key = prompt('Enter field name:')
    if (key) {
      setMetadata(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [key]: ''
        }
      }))
    }
  }

  return (
    <div className={`${className} bg-gray-900 rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Content Metadata</h3>
        {!isEditing ? (
          <IconButton
            icon="edit"
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
            aria-label="Edit metadata"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <IconButton
              icon="save"
              onClick={handleSave}
              disabled={isSaving}
              className={`text-green-500 hover:text-green-400 ${
                isSaving ? 'animate-spin' : ''
              }`}
              aria-label="Save metadata"
            />
            <IconButton
              icon="x"
              onClick={() => setIsEditing(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Cancel editing"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Title</label>
              <input
                aria-label="title"
                type="text"
                value={metadata.title}
                onChange={e => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Description</label>
              <textarea
                aria-label="description"
                value={metadata.description}
                onChange={e => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Category</label>
                <input
                  aria-label="category"
                  type="text"
                  value={metadata.category}
                  onChange={e => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Release Year</label>
                <input
                  aria-label="releaseYear"
                  type="number"
                  value={metadata.releaseYear}
                  onChange={e => setMetadata(prev => ({ ...prev, releaseYear: Number(e.target.value) }))}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Tags (comma-separated)</label>
              <input
                aria-label="tags"
                type="text"
                value={metadata.tags.join(', ')}
                onChange={e => handleTagsChange(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Expiration Date</label>
                <input
                  aria-label="expirationDate"
                  type="date"
                  value={metadata.expirationDate}
                  onChange={e => setMetadata(prev => ({ ...prev, expirationDate: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Availability (days)</label>
                <input
                  aria-label="availabilityWindow"
                  type="number"
                  value={metadata.availabilityWindow}
                  onChange={e => setMetadata(prev => ({ ...prev, availabilityWindow: Number(e.target.value) }))}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                aria-label="isPublic"
                type="checkbox"
                checked={metadata.isPublic}
                onChange={e => setMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="bg-gray-800 border-gray-700 rounded"
              />
              <label className="text-sm text-gray-400">Public Content</label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">Custom Fields</label>
                <button
                  onClick={addCustomField}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Add Field
                </button>
              </div>
              {Object.entries(metadata.customFields).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-400">{key}:</span>
                  <input
                    aria-label={key}
                    type="text"
                    value={value}
                    onChange={e => setMetadata(prev => ({
                      ...prev,
                      customFields: {
                        ...prev.customFields,
                        [key]: e.target.value
                      }
                    }))}
                    className="flex-1 bg-gray-800 text-white rounded-lg p-2 border border-gray-700"
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium">{metadata.title}</h4>
              <p className="text-gray-400 text-sm mt-1">{metadata.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="text-white ml-2">{metadata.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Release Year:</span>
                <span className="text-white ml-2">{metadata.releaseYear}</span>
              </div>
            </div>

            <div>
              <span className="text-gray-400 text-sm">Tags:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {metadata.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {metadata.expirationDate && (
              <div className="text-sm">
                <span className="text-gray-400">Expires:</span>
                <span className="text-white ml-2">
                  {new Date(metadata.expirationDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="text-sm">
              <span className="text-gray-400">Visibility:</span>
              <span className="text-white ml-2">
                {metadata.isPublic ? 'Public' : 'Private'}
              </span>
            </div>

            {Object.entries(metadata.customFields).length > 0 && (
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Custom Fields</h4>
                <div className="space-y-1">
                  {Object.entries(metadata.customFields).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-400">{key}:</span>
                      <span className="text-white ml-2">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 