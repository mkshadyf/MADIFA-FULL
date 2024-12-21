import React from "react"
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
      import.meta.env.VITE_VIMEO_CLIENT_ID!,
      import.meta.env.VITE_VIMEO_CLIENT_SECRET!,
      import.meta.env.VITE_VIMEO_ACCESS_TOKEN!
    )

    setCreating(true)
    setError(null)

    try {
      await new Promise((resolve, reject) => {
        vimeoClient.request(
          {
            method: 'POST',
            path: '/me/albums',
            query: {
              name,
              description: description || undefined,
              privacy: 'password', // Or any other privacy setting
            },
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
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
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold">Create Showcase</h3>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Name
          </label>
          <input
            placeholder="Showcase Name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={creating}
            className="w-full rounded-lg bg-gray-700 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            placeholder="Showcase Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={creating}
            rows={4}
            className="w-full rounded-lg bg-gray-700 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error ? <div className="text-sm text-red-500">{error}</div> : null}

        <button
          onClick={handleCreate}
          disabled={creating}
          className={`w-full rounded-lg px-4 py-2 ${
            creating
              ? 'cursor-not-allowed bg-gray-600'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } transition-colors`}
        >
          {creating ? 'Creating...' : 'Create Showcase'}
        </button>
      </div>
    </div>
  )
}
