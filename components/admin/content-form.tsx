'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface ContentFormProps {
  content?: Content
  onSuccess: () => void
  onCancel: () => void
}

export default function ContentForm({ content, onSuccess, onCancel }: ContentFormProps) {
  const [title, setTitle] = useState(content?.title || '')
  const [description, setDescription] = useState(content?.description || '')
  const [category, setCategory] = useState(content?.category || '')
  const [releaseYear, setReleaseYear] = useState(content?.release_year || new Date().getFullYear())
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      let thumbnailUrl = content?.thumbnail_url
      let videoUrl = content?.video_url

      // Upload thumbnail if changed
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}-${thumbnailFile.name}`
        const { error: uploadError, data } = await supabase.storage
          .from('content')
          .upload(thumbnailPath, thumbnailFile, {
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 50)
            }
          })

        if (uploadError) throw uploadError
        thumbnailUrl = data.path
      }

      // Upload video if changed
      if (videoFile) {
        const videoPath = `videos/${Date.now()}-${videoFile.name}`
        const { error: uploadError, data } = await supabase.storage
          .from('content')
          .upload(videoPath, videoFile, {
            onUploadProgress: (progress) => {
              setUploadProgress(50 + (progress.loaded / progress.total) * 50)
            }
          })

        if (uploadError) throw uploadError
        videoUrl = data.path
      }

      const contentData = {
        title,
        description,
        category,
        release_year: releaseYear,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        updated_at: new Date().toISOString()
      }

      if (content) {
        const { error } = await supabase
          .from('content')
          .update(contentData)
          .eq('id', content.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('content')
          .insert([contentData])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          >
            <option value="">Select Category</option>
            <option value="movies">Movies</option>
            <option value="series">Series</option>
            <option value="music">Music</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-white"
          />
        </div>
      </div>

      {loading && (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-white bg-gray-700 rounded-md hover:bg-gray-600"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : content ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
} 