import React from "react"
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { supabase } from '@/lib/supabase/client'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { VideoPlayer } from '@/components/video/VideoPlayer'


interface VideoData {
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
}

export default function WatchPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [video, setVideo] = useState<VideoData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        if (!data) throw new Error('Video not found')

        setVideo(data)
      } catch (err) {
        console.error('Error loading video:', err)
        setError(err instanceof Error ? err.message : 'Failed to load video')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchVideo()
  }, [id])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error</h1>
          <p className="mt-2">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AuthGuard allowedRoles={['user', 'admin']} />
      <ErrorBoundary>
        <div className={`container mx-auto ${isMobile ? 'px-4' : 'px-8'}`}>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-[60vh] w-full rounded-lg bg-gray-200"></div>
            </div>
          ) : video ? (
            <div className="space-y-4">
              <VideoPlayer url={video.url} thumbnail={video.thumbnail} title={video.title} />
              <h1 className="text-2xl font-bold">{video.title}</h1>
              <p className="text-gray-600">{video.description}</p>
            </div>
          ) : null}
        </div>
      </ErrorBoundary>
    </div>
  )
}
