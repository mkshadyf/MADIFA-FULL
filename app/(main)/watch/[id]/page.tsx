'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import VideoPlayer from '@/components/ui/video-player'
import { getStreamUrl, trackProgress } from '@/lib/services/content-delivery'
import type { Content } from '@/lib/supabase/types'

export default function WatchPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<Content | null>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }

    const initializeStream = async () => {
      const { streamUrl, content, error } = await getStreamUrl(params.id)
      
      if (error) {
        setError(error)
        return
      }

      setContent(content)
      setStreamUrl(streamUrl)
    }

    initializeStream()
  }, [params.id, user])

  const handleTimeUpdate = async (currentTime: number) => {
    if (content) {
      await trackProgress(content.id, currentTime, content.duration)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!content || !streamUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VideoPlayer
          content={content}
          streamUrl={streamUrl}
          onTimeUpdate={handleTimeUpdate}
        />

        <div className="mt-8">
          <h1 className="text-2xl font-bold text-white">{content.title}</h1>
          <p className="mt-2 text-gray-400">{content.description}</p>
          
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
            <span>{content.release_year}</span>
            <span>•</span>
            <span>{content.category}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 