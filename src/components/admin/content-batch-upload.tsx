import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import { createClient } from '@/lib/supabase/client'
import { uploadContent } from '@/lib/utils/content-upload'

import UploadProgress from './upload-progress'

interface BatchFile {
  id: string
  file: File
  title: string
  description: string
  category: string
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
}

export default function ContentBatchUpload() {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles: BatchFile[] = Array.from(e.target.files).map(file => ({
      id: generateId(),
      file,
      title: file.name.split('.')[0],
      description: '',
      category: '',
      progress: 0,
      status: 'pending',
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const uploadFile = async (file: BatchFile) => {
    try {
      const url = await uploadContent(file.file, {
        onProgress: (progress) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, progress: progress.percent } : f
            )
          )
        }
      })
      return url
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      await Promise.all(
        files.map(async batchFile => {
          try {
            // Update file status
            setFiles(prev =>
              prev.map(f => (f.id === batchFile.id ? { ...f, status: 'uploading' } : f))
            )

            // Upload file
            const contentUrl = await uploadFile(batchFile)

            // Create content record
            const { error: dbError } = await supabase.from('content').insert({
              title: batchFile.title,
              description: batchFile.description,
              category: batchFile.category,
              thumbnail_url: contentUrl,
              release_year: new Date().getFullYear(),
            })

            if (dbError) throw dbError

            // Update file status to complete
            setFiles(prev =>
              prev.map(f => (f.id === batchFile.id ? { ...f, status: 'complete' } : f))
            )
          } catch (error) {
            // Update file status to error
            setFiles(prev =>
              prev.map(f =>
                f.id === batchFile.id
                  ? {
                      ...f,
                      status: 'error',
                      error: error instanceof Error ? error.message : 'Upload failed',
                    }
                  : f
              )
            )
          }
        })
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Batch Upload</h2>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          Add Files
        </button>
        <input
          title="Select files"
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-4">
            {files.map(file => (
              <div key={file.id} className="rounded-lg bg-gray-800 p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <input
                      type="text"
                      value={file.title}
                      onChange={e =>
                        setFiles(prev =>
                          prev.map(f => (f.id === file.id ? { ...f, title: e.target.value } : f))
                        )
                      }
                      className="rounded-md bg-gray-700 px-2 py-1 text-white"
                      placeholder="Title"
                      required
                    />
                    <select
                      title="Select category"
                      value={file.category}
                      onChange={e =>
                        setFiles(prev =>
                          prev.map(f => (f.id === file.id ? { ...f, category: e.target.value } : f))
                        )
                      }
                      className="ml-2 rounded-md bg-gray-700 px-2 py-1 text-white"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="movies">Movies</option>
                      <option value="series">Series</option>
                      <option value="documentaries">Documentaries</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={uploading}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>

                <textarea
                  title="Enter description"
                  value={file.description}
                  onChange={e =>
                    setFiles(prev =>
                      prev.map(f => (f.id === file.id ? { ...f, description: e.target.value } : f))
                    )
                  }
                  className="mb-4 w-full rounded-md bg-gray-700 px-2 py-1 text-white"
                  placeholder="Description"
                  rows={2}
                  required
                />

                <UploadProgress
                  progress={file.progress}
                  status={file.status === 'error' ? file.error : file.status}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploading || !files.length}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
        </form>
      )}

      {!files.length && <div className="py-12 text-center text-gray-400">No files selected</div>}
    </div>
  )
}
