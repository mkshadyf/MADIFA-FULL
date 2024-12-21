import React from "react"
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/supabase/types'
import { uploadContent } from '@/lib/utils/content-upload'

export default function ContentUpload() {
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
      const thumbnailUrl = await uploadContent(thumbnailFile, {
        onProgress: (progress: { loaded: number; total: number }) => {
          setUploadProgress((progress.loaded / progress.total) * 50)
        }
      })

      const videoUrl = await uploadContent(videoFile, {
        onProgress: (progress: { loaded: number; total: number }) => {
          setUploadProgress(50 + (progress.loaded / progress.total) * 50)
        }
      })

      // Create content record
      const { error: dbError } = await supabase.from('content').insert({
        title,
        description,
        category,
        release_year: releaseYear,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
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
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Upload Content</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <input
            title="Title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            title="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              title="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            >
              <option value="">Select Category</option>
              <option value="movies">Movies</option>
              <option value="series">Series</option>
              <option value="documentaries">Documentaries</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Release Year</label>
            <input
              title="Release Year"
              type="number"
              value={releaseYear}
              onChange={e => setReleaseYear(parseInt(e.target.value))}
              required
              min="1900"
              max={new Date().getFullYear()}
              className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
            <input
              title="Thumbnail"
              type="file"
              accept="image/*"
              onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
              required
              className="mt-1 block w-full text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Video</label>
            <input
              title="Video"
              type="file"
              accept="video/*"
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
              required
              className="mt-1 block w-full text-white"
            />
          </div>
        </div>

        {uploadProgress > 0 && (
          <div className="relative pt-1">
            <div className="flex h-2 overflow-hidden rounded bg-gray-700 text-xs">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="flex flex-col justify-center whitespace-nowrap bg-indigo-500 text-center text-white shadow-none"
              />
            </div>
            <div className="text-right">
              <span className="inline-block text-sm font-semibold text-gray-300">
                {Math.round(uploadProgress)}%
              </span>
            </div>
          </div>
        )}

        {error ? <div className="text-sm text-red-500">{error}</div> : null}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Content'}
          </button>
        </div>
      </form>
    </div>
  )
}
