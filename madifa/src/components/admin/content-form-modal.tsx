

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Content = Database['public']['Tables']['content']['Row']

interface ContentFormModalProps {
  content?: Content
  onClose: () => void
  onSuccess: () => void
}

export default function ContentFormModal({ content, onClose, onSuccess }: ContentFormModalProps) {
  const [title, setTitle] = useState(content?.title || '')
  const [description, setDescription] = useState(content?.description || '')
  const [category, setCategory] = useState(content?.category || '')
  const [releaseYear, setReleaseYear] = useState(content?.release_year || new Date().getFullYear())
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let thumbnailUrl = content?.thumbnail_url
      let videoUrl = content?.video_url

      // Upload thumbnail if changed
      if (thumbnailFile) {
        const thumbnailPath = `thumbnails/${Date.now()}-${thumbnailFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(thumbnailPath, thumbnailFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('content')
          .getPublicUrl(thumbnailPath)

        thumbnailUrl = publicUrl
      }

      // Upload video if changed
      if (videoFile) {
        const videoPath = `videos/${Date.now()}-${videoFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(videoPath, videoFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('content')
          .getPublicUrl(videoPath)

        videoUrl = publicUrl
      }

      // Update or create content
      const contentData = {
        title,
        description,
        category,
        release_year: releaseYear,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">
          {content ? 'Edit Content' : 'Add New Content'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="movies">Movies</option>
                <option value="series">Series</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Release Year
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 
