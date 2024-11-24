'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadContent } from '@/lib/utils/content-upload'
import type { Content } from '@/lib/supabase/types'
import type { UploadProgress } from '@/lib/types/upload'

export default function ContentForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear())
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleUploadProgress = (progress: UploadProgress) => {
    setUploadProgress((progress.loaded / progress.total) * 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!thumbnailFile || !videoFile) {
      setError('Please select both thumbnail and video files')
      return
    }

    setLoading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Upload thumbnail
      const thumbnailUrl = await uploadContent(thumbnailFile, 'thumbnails', {
        onProgress: handleUploadProgress
      })

      // Upload video
      const videoUrl = await uploadContent(videoFile, 'videos', {
        onProgress: handleUploadProgress
      })

      // Create content record
      const { error: dbError } = await supabase
        .from('content')
        .insert({
          title,
          description,
          category,
          release_year: releaseYear,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          status: 'processing'
        })

      if (dbError) throw dbError

      // Reset form
      setTitle('')
      setDescription('')
      setCategory('')
      setReleaseYear(new Date().getFullYear())
      setThumbnailFile(null)
      setVideoFile(null)
      setUploadProgress(0)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
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
          type="submit"
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Create'}
        </button>
      </div>
    </form>
  )
} 