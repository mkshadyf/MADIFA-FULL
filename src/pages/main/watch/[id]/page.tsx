'use client'

import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import VideoPlayer from '@/components/video/VideoPlayer'
import { useAuth } from '@/hooks/useAuth'
import { watchHistoryService } from '@/lib/services/watch-history'
import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types/content'

export default function WatchPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [content, setContent] = useState<Content | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if no ID is provided
  if (!id) {
    return <Navigate to="/browse" replace />
  }

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Get content details from Supabase
        const supabase = createClient()
        const { data, error: contentError } = await supabase
          .from('content')
          .select('*')
          .eq('id', id)
          .single()

        if (contentError) throw contentError
        if (!data) throw new Error('Content not found')

        setContent(data)

        // Get watch progress if user is logged in
        if (user?.id) {
          const history = await watchHistoryService.getWatchHistory(user.id, 1)
          const lastWatch = history.find(h => h.vimeo_id === id)
          if (lastWatch) {
            setStartTime(lastWatch.progress)
          }
        }
      } catch (error) {
        console.error('Error loading content:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load content'
        )
      } finally {
        setLoading(false)
      }
    }

    void loadContent()
  }, [id, user?.id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">
            {error || 'Content not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main>
        <VideoPlayer
          content={content}
          startTime={startTime}
          onProgress={progress => {
            // Update watch history
            if (user?.id) {
              void watchHistoryService.updateWatchProgress(
                user.id,
                id,
                progress
              )
            }
          }}
        />
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="mb-2 text-2xl font-bold text-white">
            {content.title}
          </h1>
          <p className="text-gray-400">{content.description}</p>
        </div>
      </main>
    </div>
  )
}
