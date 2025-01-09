import { IconButton } from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { getContent, updateContent } from '@/lib/services/content-manager'
import type { Content } from '@/types/content'
import { useEffect, useState } from 'react'

interface ContentMetadataEditorProps {
  className?: string
  contentId: string
  onUpdate?: () => void
}

export default function ContentMetadataEditor({
  className = '',
  contentId,
  onUpdate,
}: ContentMetadataEditorProps) {
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [metadata, setMetadata] = useState<Partial<Content>>({
    title: '',
    description: '',
    category: '',
    tags: [],
    release_year: new Date().getFullYear(),
    expiration_date: '',
    availability_window: 0,
    is_public: true,
    custom_fields: {},
  })

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const content = await getContent(contentId)
        if (content) {
          setMetadata({
            title: content.title || '',
            description: content.description || '',
            category: content.category || '',
            tags: content.tags || [],
            release_year: content.release_year || new Date().getFullYear(),
            expiration_date: content.expiration_date || '',
            availability_window: content.availability_window ?? 0,
            is_public: content.is_public ?? true,
            custom_fields: content.custom_fields || {},
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
      await updateContent(contentId, metadata)
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
      tags: value
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean),
    }))
  }

  const addCustomField = () => {
    const key = window.prompt('Enter field name:')
    if (key && key.trim()) {
      setMetadata(prev => ({
        ...prev,
        custom_fields: {
          ...(prev.custom_fields || {}),
          [key.trim()]: '',
        },
      }))
    }
  }

  return (
    <div className={`${className} rounded-lg bg-gray-900 p-4`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Content Metadata</h3>
        {!isEditing ? (
          <IconButton
            label="Edit Metadata"
            icon="edit"
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
            aria-label="Edit metadata"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <IconButton
              label="Save Metadata"
              icon="save"
              onClick={handleSave}
              disabled={isSaving}
              className={`text-green-500 hover:text-green-400 ${isSaving ? 'animate-spin' : ''}`}
              aria-label="Save metadata"
            />
            <IconButton
              label="Cancel Editing"
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
              <label className="mb-1 block text-sm text-gray-400">Title</label>
              <input
                aria-label="title"
                type="text"
                value={metadata.title}
                onChange={e =>
                  setMetadata(prev => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Description
              </label>
              <textarea
                aria-label="description"
                value={metadata.description}
                onChange={e =>
                  setMetadata(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-[100px] w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Category
                </label>
                <input
                  aria-label="category"
                  type="text"
                  value={metadata.category}
                  onChange={e =>
                    setMetadata(prev => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Release Year
                </label>
                <input
                  aria-label="release_year"
                  type="number"
                  value={metadata.release_year}
                  onChange={e =>
                    setMetadata(prev => ({
                      ...prev,
                      release_year: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Tags (comma-separated)
              </label>
              <input
                aria-label="tags"
                type="text"
                value={metadata.tags?.join(', ') || ''}
                onChange={e => handleTagsChange(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Expiration Date
                </label>
                <input
                  aria-label="expiration_date"
                  type="date"
                  value={metadata.expiration_date}
                  onChange={e =>
                    setMetadata(prev => ({
                      ...prev,
                      expiration_date: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Availability (days)
                </label>
                <input
                  aria-label="availability_window"
                  type="number"
                  value={metadata.availability_window}
                  onChange={e =>
                    setMetadata(prev => ({
                      ...prev,
                      availability_window: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                aria-label="is_public"
                type="checkbox"
                checked={metadata.is_public}
                onChange={e =>
                  setMetadata(prev => ({
                    ...prev,
                    is_public: e.target.checked,
                  }))
                }
                className="rounded border-gray-700 bg-gray-800"
              />
              <label className="text-sm text-gray-400">Public Content</label>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm text-gray-400">Custom Fields</label>
                <button
                  onClick={addCustomField}
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Add Field
                </button>
              </div>
              {Object.entries(metadata.custom_fields || {}).map(
                ([key, value]) => (
                  <div key={key} className="mb-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-400">{key}:</span>
                    <input
                      aria-label={key}
                      type="text"
                      value={value}
                      onChange={e =>
                        setMetadata(prev => ({
                          ...prev,
                          custom_fields: {
                            ...(prev.custom_fields || {}),
                            [key]: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 rounded-lg border border-gray-700 bg-gray-800 p-2 text-white"
                    />
                  </div>
                )
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white">{metadata.title}</h4>
              <p className="mt-1 text-sm text-gray-400">
                {metadata.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Category:</span>
                <span className="ml-2 text-white">{metadata.category}</span>
              </div>
              <div>
                <span className="text-gray-400">Release Year:</span>
                <span className="ml-2 text-white">{metadata.release_year}</span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-400">Tags:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {metadata.tags?.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {metadata.expiration_date ? (
              <div className="text-sm">
                <span className="text-gray-400">Expires:</span>
                <span className="ml-2 text-white">
                  {new Date(metadata.expiration_date).toLocaleDateString()}
                </span>
              </div>
            ) : null}

            <div className="text-sm">
              <span className="text-gray-400">Visibility:</span>
              <span className="ml-2 text-white">
                {metadata.is_public ? 'Public' : 'Private'}
              </span>
            </div>

            {metadata.custom_fields &&
              Object.entries(metadata.custom_fields).length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm text-gray-400">Custom Fields</h4>
                  <div className="space-y-1">
                    {Object.entries(metadata.custom_fields).map(
                      ([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-400">{key}:</span>
                          <span className="ml-2 text-white">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  )
}
