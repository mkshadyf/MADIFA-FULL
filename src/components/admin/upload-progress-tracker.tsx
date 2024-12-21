import React from "react"
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'


interface UploadStatus {
  id: string
  filename: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
  created_at: string
}

export default function UploadProgressTracker () {
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

    void fetchUploads()

    // Subscribe to upload status changes
    const channel = supabase
      .channel('upload_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upload_status',
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setUploads(prev => [payload.new as UploadStatus, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setUploads(prev =>
              prev.map(upload =>
                upload.id === payload.new.id ? { ...upload, ...payload.new } : upload
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
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
    <div className="rounded-lg bg-gray-800 p-4">
      <h2 className="mb-4 text-lg font-medium text-white">Upload Progress</h2>

      <div className="space-y-4">
        {uploads.map(upload => (
          <div key={upload.id} className="bg-gray-750 rounded-lg p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="font-medium text-white">{upload.filename}</h3>
                <p className={`text-sm ${getStatusColor(upload.status)}`}>
                  {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {new Date(upload.created_at).toLocaleString()}
              </span>
            </div>

            <div className="mb-2 h-2.5 w-full rounded-full bg-gray-700">
              <div
                className={`h-2.5 rounded-full ${
                  upload.status === 'error' ? 'bg-red-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>

            {upload.error ? <p className="mt-2 text-sm text-red-400">{upload.error}</p> : null}

            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{Math.round(upload.progress)}%</span>
              {upload.status === 'uploading' && <span>Uploading...</span>}
              {upload.status === 'processing' && <span>Processing...</span>}
              {upload.status === 'complete' && <span>Upload complete</span>}
              {upload.status === 'error' && <span>Upload failed</span>}
            </div>
          </div>
        ))}
      </div>

      {uploads.length === 0 && (
        <div className="py-8 text-center text-gray-400">No recent uploads</div>
      )}
    </div>
  )
}
