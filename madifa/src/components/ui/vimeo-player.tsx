

import { useEffect, useRef } from 'react'
import Player from '@vimeo/player'
import { useAuth } from '@/components/providers/AuthProvider'
import { updateWatchProgress } from '@/lib/services/watch-history'
import { getSubscriptionStatus } from '@/lib/services/subscription'

interface VimeoPlayerProps {
  videoId: string
  startTime?: number
  requiresSubscription?: boolean
}

export default function VimeoPlayer({ 
  videoId, 
  startTime = 0,
  requiresSubscription = true 
}: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstance = useRef<Player | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const initPlayer = async () => {
      if (!playerRef.current) return

      // Check subscription if required
      if (requiresSubscription && user) {
        const subscription = await getSubscriptionStatus(user.id)
        if (subscription?.status !== 'active') {
          // Show subscription required message
          return
        }
      }

      // Initialize player
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

      // Track progress for logged-in users
      if (user?.id) {
        const handleTimeUpdate = (data: { seconds: number, percent: number }) => {
          updateWatchProgress(user.id, videoId, data.percent)
        }
        playerInstance.current.on('timeupdate', handleTimeUpdate)
      }
    }

    initPlayer()

    return () => {
      playerInstance.current?.destroy()
    }
  }, [videoId, startTime, user, requiresSubscription])

  return (
    <div className="relative aspect-video w-full bg-black">
      <div ref={playerRef} className="absolute inset-0" />
    </div>
  )
} 
