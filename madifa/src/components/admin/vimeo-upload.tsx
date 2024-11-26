

import { useState, useRef } from 'react'
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
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_ID!,
      process.env.NEXT_PUBLIC_VIMEO_CLIENT_SECRET!,
      process.env.NEXT_PUBLIC_VIMEO_ACCESS_TOKEN!
    )

    setUploading(true)
    setError(null)

    try {
      await new Promise((resolve, reject) => {
        vimeoClient.upload(
          file,
          {
            name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            description: "Uploaded via admin dashboard",
            privacy: { view: 'disable' } // Private by default
          },
          (uri) => {
            console.log('Upload completed:', uri)
            resolve(uri)
          },
          (error) => {
            console.error('Upload error:', error)
            reject(error)
          },
          (bytes_uploaded, bytes_total) => {
            setProgress({
              loaded: bytes_uploaded,
              total: bytes_total,
              percent: Math.round((bytes_uploaded / bytes_total) * 100)
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
    <div className="p-6 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Upload to Vimeo</h3>
      
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUpload(file)
          }}
          disabled={uploading}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-600 file:text-white
            hover:file:bg-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {uploading && progress && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="text-sm text-gray-400">
              {Math.round(progress.loaded / 1024 / 1024)}MB of {Math.round(progress.total / 1024 / 1024)}MB ({progress.percent}%)
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 
