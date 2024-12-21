import React from "react"
import { useRef, useState } from 'react'
import { Vimeo } from '@vimeo/vimeo'


interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export default function VimeoUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    const vimeoClient = new Vimeo(
      import.meta.env.VITE_VIMEO_CLIENT_ID!,
      import.meta.env.VITE_VIMEO_CLIENT_SECRET!,
      import.meta.env.VITE_VIMEO_ACCESS_TOKEN!
    )

    setUploading(true)
    setError(null)

    try {
      await new Promise((resolve, reject) => {
        vimeoClient.upload(
          file,
          {
            name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            description: 'Uploaded via admin dashboard',
            privacy: { view: 'disable' }, // Private by default
          },
          uri => {
            console.info('Upload completed:', uri)
            resolve(uri)
          },
          error => {
            console.error('Upload error:', error)
            reject(error)
          },
          (bytes_uploaded, bytes_total) => {
            setProgress({
              loaded: bytes_uploaded,
              total: bytes_total,
              percent: Math.round((bytes_uploaded / bytes_total) * 100),
            })
          }
        )
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h3 className="mb-4 text-lg font-semibold">Upload to Vimeo</h3>

      <div className="space-y-4">
        <input
          placeholder="Select a video to upload"
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) void handleUpload(file)
          }}
          disabled={uploading}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:rounded-full file:border-0
            file:bg-indigo-600 file:px-4
            file:py-2 file:text-sm
            file:font-semibold file:text-white
            hover:file:bg-indigo-700
            disabled:cursor-not-allowed disabled:opacity-50"
        />

        {uploading && progress ? (
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="text-sm text-gray-400">
              {Math.round(progress.loaded / 1024 / 1024)}MB of{' '}
              {Math.round(progress.total / 1024 / 1024)}MB ({progress.percent}%)
            </div>
          </div>
        ) : null}

        {error ? <div className="text-sm text-red-500">{error}</div> : null}
      </div>
    </div>
  )
}
