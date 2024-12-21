import React from "react"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'

interface ContentFormModalProps {
  content?: Content
  onClose: () => void
  onSuccess: () => void
}

export default function ContentFormModal({
  content,
  onClose,
  onSuccess,
}: ContentFormModalProps) {
  const [title, setTitle] = useState(content?.title || '')
  const [description, setDescription] = useState(content?.description || '')
  const [category, setCategory] = useState(content?.category || '')
  const [releaseYear, setReleaseYear] = useState(
    content?.release_year || new Date().getFullYear()
  )
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

        const {
          data: { publicUrl },
        } = supabase.storage.from('content').getPublicUrl(thumbnailPath)

        thumbnailUrl = publicUrl
      }

      // Upload video if changed
      if (videoFile) {
        const videoPath = `videos/${Date.now()}-${videoFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(videoPath, videoFile)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from('content').getPublicUrl(videoPath)

        videoUrl = publicUrl
      }

      // Update or create content
      const contentData: Partial<Content> = {
        title,
        description,
        category,
        release_year: releaseYear,
        thumbnail_url: thumbnailUrl,
        video_url: videoUrl,
        status: 'processing',
        updated_at: new Date().toISOString(),
        ...(content ? {} : { 
          created_at: new Date().toISOString(),
          views: 0,
          duration: 0,
          size: videoFile?.size || 0,
        }),
      }

      if (content?.id) {
        const { error } = await supabase
          .from('videos')
          .update(contentData)
          .eq('id', content.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('videos').insert([contentData])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">
          {content ? 'Edit Content' : 'Add New Content'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              title="Title"
              placeholder="Title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              title="Description"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                title="Category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="movies">Movies</option>
                <option value="series">Series</option>
                <option value="music">Music</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">
                Release Year
              </label>
              <input
                title="Release Year"
                placeholder="Release Year"
                type="number"
                value={releaseYear}
                onChange={e => setReleaseYear(Number(e.target.value))}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Thumbnail
            </label>
            <input
              title="Thumbnail"
              placeholder="Thumbnail"
              type="file"
              accept="image/*"
              onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Video File
            </label>
            <input
              title="Video File"
              placeholder="Video File"
              type="file"
              accept="video/*"
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
            />
          </div>

          {error ? <div className="text-sm text-red-500">{error}</div> : null}

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
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
