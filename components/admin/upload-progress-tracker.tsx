'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadStatus {
  id: string
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  created_at: string
}

export default function UploadProgressTracker() {
  const [uploads, setUploads] = useState<UploadStatus[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const { data, error } = await supabase
          .from('upload_status')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error
        setUploads(data || [])
      } catch (error) {
        console.error('Error fetching uploads:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUploads()

    // Subscribe to upload status changes
    const channel = supabase
      .channel('upload_status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'upload_status'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setUploads(prev => [payload.new as UploadStatus, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setUploads(prev =>
            prev.map(upload =>
              upload.id === payload.new.id ? { ...upload, ...payload.new } : upload
            )
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getStatusColor = (status: UploadStatus['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-400'
      case 'processing':
        return 'text-yellow-400'
      case 'complete':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  if (loading) return <div>Loading uploads...</div>

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-lg font-medium text-white mb-4">Upload Progress</h2>

      <div className="space-y-4">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="bg-gray-750 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-white font-medium">{upload.filename}</h3>
                <p className={`text-sm ${getStatusColor(upload.status)}`}>
                  {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(upload.created_at).toLocaleString()}
              </span>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full ${
                  upload.status === 'error' ? 'bg-red-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>

            {upload.error && (
              <p className="text-sm text-red-400 mt-2">{upload.error}</p>
            )}

            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{Math.round(upload.progress)}%</span>
              {upload.status === 'uploading' && (
                <span>Uploading...</span>
              )}
              {upload.status === 'processing' && (
                <span>Processing...</span>
              )}
              {upload.status === 'complete' && (
                <span>Upload complete</span>
              )}
              {upload.status === 'error' && (
                <span>Upload failed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {uploads.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          No recent uploads
        </div>
      )}
    </div>
  )
} 