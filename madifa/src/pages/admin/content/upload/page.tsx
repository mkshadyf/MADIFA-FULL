

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadContent } from '@/lib/utils/content-upload'
import type { Content } from '@/lib/supabase/types'

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
      // Upload thumbnail
      const thumbnailUrl = await uploadContent(thumbnailFile, 'thumbnails', {
        onProgress: (progress) => {
          setUploadProgress(progress.loaded / progress.total * 50)
        }
      })

      // Upload video
      const videoUrl = await uploadContent(videoFile, 'videos', {
        onProgress: (progress) => {
          setUploadProgress(50 + progress.loaded / progress.total * 50)
        }
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
          video_url: videoUrl
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Upload Content</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
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
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(parseInt(e.target.value))}
              required
              min="1900"
              max={new Date().getFullYear()}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              required
              className="mt-1 block w-full text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              required
              className="mt-1 block w-full text-white"
            />
          </div>
        </div>

        {uploadProgress > 0 && (
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
              />
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold inline-block text-gray-300">
                {Math.round(uploadProgress)}%
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Content'}
          </button>
        </div>
      </form>
    </div>
  )
} 
