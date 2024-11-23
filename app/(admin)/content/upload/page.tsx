'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadContent } from '@/lib/utils/content-upload'
import UploadProgress from '@/components/admin/upload-progress'
import type { ChangeEvent, FormEvent } from 'react'

interface UploadForm {
  title: string
  description: string
  category: string
  releaseYear: number
  language: string
  ageRating: string
  duration: number
}

const initialForm: UploadForm = {
  title: '',
  description: '',
  category: '',
  releaseYear: new Date().getFullYear(),
  language: '',
  ageRating: '',
  duration: 0
}

export default function ContentUpload() {
  const [form, setForm] = useState<UploadForm>(initialForm)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)

    try {
      if (!thumbnailFile || !videoFile) {
        throw new Error('Please select both thumbnail and video files')
      }

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
          ...form,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      setSuccess(true)
      setForm(initialForm)
      setThumbnailFile(null)
      setVideoFile(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Upload Content</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Release Year</label>
            <input
              type="number"
              value={form.releaseYear}
              onChange={(e) => setForm({ ...form, releaseYear: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              required
            >
              <option value="">Select Language</option>
              <option value="english">English</option>
              <option value="zulu">Zulu</option>
              <option value="xhosa">Xhosa</option>
              <option value="afrikaans">Afrikaans</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Age Rating</label>
            <select
              value={form.ageRating}
              onChange={(e) => setForm({ ...form, ageRating: e.target.value })}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              required
            >
              <option value="">Select Rating</option>
              <option value="all">All Ages</option>
              <option value="7+">7+</option>
              <option value="13+">13+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setThumbnailFile(e.target.files?.[0] || null)
              }
              className="mt-1 block w-full text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Video File</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e: ChangeEvent<HTMLInputElement>) => 
                setVideoFile(e.target.files?.[0] || null)
              }
              className="mt-1 block w-full text-white"
              required
            />
          </div>
        </div>

        {loading && <UploadProgress progress={uploadProgress} />}

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        {success && (
          <div className="text-green-500 text-sm">Content uploaded successfully!</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload Content'}
          </button>
        </div>
      </form>
    </div>
  )
} 