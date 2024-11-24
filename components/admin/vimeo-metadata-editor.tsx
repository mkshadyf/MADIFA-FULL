'use client'

import { useState } from 'react'
import { Vimeo } from '@vimeo/vimeo'
import type { VimeoVideo } from '@/types/vimeo'

interface MetadataEditorProps {
  video: VimeoVideo
  onUpdate: () => void
}

export default function VimeoMetadataEditor({ video, onUpdate }: MetadataEditorProps) {
  const [title, setTitle] = useState(video.name)
  const [description, setDescription] = useState(video.description)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const vimeoClient = new Vimeo(
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
    )

    try {
      setSaving(true)
      await new Promise((resolve, reject) => {
        vimeoClient.request({
          method: 'PATCH',
          path: video.uri,
          query: {
            name: title,
            description: description
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating video metadata:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Edit Video Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full px-4 py-2 rounded-lg ${
            saving
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
} 