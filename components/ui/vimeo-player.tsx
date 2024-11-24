'use client'

import { useEffect, useRef } from 'react'
import Player from '@vimeo/player'
import { useAuth } from '@/components/providers/AuthProvider'
import { updateWatchProgress } from '@/lib/services/watch-history'

interface VimeoPlayerProps {
  videoId: string
  startTime?: number
}

export default function VimeoPlayer({ videoId, startTime = 0 }: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstance = useRef<Player | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!playerRef.current) return

    // Initialize Vimeo player
    playerInstance.current = new Player(playerRef.current, {
      id: videoId,
      width: '100%',
      height: '100%',
      controls: true,
      responsive: true,
      dnt: true,
      playsinline: true,
      title: false,
      byline: false,
      portrait: false
    })

    // Set start time if provided
    if (startTime > 0) {
      playerInstance.current.setCurrentTime(startTime)
    }

    // Track progress
    const handleTimeUpdate = (data: { seconds: number, percent: number }) => {
      if (user?.id) {
        updateWatchProgress(user.id, videoId, data.percent)
      }
    }

    playerInstance.current.on('timeupdate', handleTimeUpdate)

    return () => {
      playerInstance.current?.off('timeupdate', handleTimeUpdate)
      playerInstance.current?.destroy()
    }
  }, [videoId, startTime, user?.id])

  return (
    <div className="relative aspect-video w-full bg-black">
      <div ref={playerRef} className="absolute inset-0" />
    </div>
  )
} 