import { useState } from 'react'
import { Vimeo } from '@vimeo/vimeo'

import type { VimeoVideo } from '@/types/vimeo'

interface MetadataEditorProps {
  video: VimeoVideo
  onUpdate: () => void
}

export default function VimeoMetadataEditor({
  video,
  onUpdate,
}: MetadataEditorProps) {
  const [title, setTitle] = useState(video.name)
  const [description, setDescription] = useState(video.description)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const vimeoClient = new Vimeo(
      import.meta.env.VITE_VIMEO_CLIENT_ID!,
      import.meta.env.VITE_VIMEO_CLIENT_SECRET!,
      import.meta.env.VITE_VIMEO_ACCESS_TOKEN!
    )

    try {
      setSaving(true)
      await new Promise((resolve, reject) => {
        vimeoClient.request(
          {
            method: 'PATCH',
            path: video.uri,
            query: {
              name: title,
              description: description,
            },
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating video metadata:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold">Edit Video Details</h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="video-title"
            className="mb-1 block text-sm font-medium text-gray-300"
          >
            Title
          </label>
          <input
            id="video-title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg bg-gray-700 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter video title"
            aria-label="Video title"
          />
        </div>
        <div>
          <label
            htmlFor="video-description"
            className="mb-1 block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="video-description"
            value={description || ''}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg bg-gray-700 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter video description"
            aria-label="Video description"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className={`w-full rounded-lg px-4 py-2 ${
            saving
              ? 'cursor-not-allowed bg-gray-600'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors`}
          role="button"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
