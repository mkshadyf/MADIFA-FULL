'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { getVideoDetails } from '@/lib/services/vimeo'
import { getWatchHistory } from '@/lib/services/watch-history'
import VimeoPlayer from '@/components/ui/vimeo-player'
import Loading from '@/components/ui/loading'
import type { VimeoVideo } from '@/types/vimeo'

export default function WatchPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState<VimeoVideo | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Get video details from Vimeo
        const videoDetails = await getVideoDetails(id as string)
        setVideo(videoDetails)

        // Get watch progress if user is logged in
        if (user?.id) {
          const history = await getWatchHistory(user.id, 1)
          const lastWatch = history.find(h => h.vimeo_id === id)
          if (lastWatch) {
            setStartTime(lastWatch.progress * videoDetails.duration)
          }
        }
      } catch (error) {
        console.error('Error loading video:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVideo()
  }, [id, user?.id])

  if (loading) return <Loading />

  if (!video) return <div>Video not found</div>

  return (
    <div className="min-h-screen bg-gray-900">
      <main>
        <VimeoPlayer videoId={id as string} startTime={startTime} />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">{video.name}</h1>
          <p className="text-gray-400">{video.description}</p>
        </div>
      </main>
    </div>
  )
} 