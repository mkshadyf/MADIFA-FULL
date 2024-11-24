'use client'

import { useState } from 'react'
import { Vimeo } from '@vimeo/vimeo'

export default function VimeoShowcaseCreator() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    const vimeoClient = new Vimeo(
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
    )

    setCreating(true)
    setError(null)

    try {
      await new Promise((resolve, reject) => {
        vimeoClient.request({
          method: 'POST',
          path: '/me/albums',
          query: {
            name,
            description: description || undefined,
            privacy: 'password' // Or any other privacy setting
          }
        }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        })
      })

      // Clear form
      setName('')
      setDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create showcase')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Create Showcase</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={creating}
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
            disabled={creating}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className={`w-full px-4 py-2 rounded-lg ${
            creating
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors`}
        >
          {creating ? 'Creating...' : 'Create Showcase'}
        </button>
      </div>
    </div>
  )
} 