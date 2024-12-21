import React from "react"
import { useEffect, useRef } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import Player from '@vimeo/player'

import { subscriptionService } from '@/lib/services/subscription'
import { updateWatchProgress } from '@/lib/services/watch-history'

interface VimeoPlayerProps {
  videoId: string
  startTime?: number
  requiresSubscription?: boolean
}

export default function VimeoPlayer ({
  videoId,
  startTime = 0,
  requiresSubscription = true,
}: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstance = useRef<Player | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const initPlayer = async () => {
      if (!playerRef.current) return

      // Check subscription if required
      if (requiresSubscription && user) {
        const subscription = await subscriptionService.getCurrentSubscription(user.id)
        if (subscription?.status !== 'active') {
          playerRef.current.innerHTML = `
            <div class="flex h-full w-full flex-col items-center justify-center bg-gray-900 p-4 text-center">
              <h2 class="mb-4 text-2xl font-bold text-white">Premium Content</h2>
              <p class="mb-6 text-gray-300">This content requires an active subscription.</p>
              <a href="/subscription" class="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700">
                Subscribe Now
              </a>
            </div>
          `
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
        portrait: false,
      })

      // Set start time if provided
      if (startTime > 0) {
        await playerInstance.current?.setCurrentTime(startTime)
      }

      // Track progress for logged-in users
      if (user?.id) {
        const handleTimeUpdate = (data: { seconds: number }) => {
          void updateWatchProgress(user.id, videoId, data.seconds)
        }
        playerInstance.current?.on('timeupdate', handleTimeUpdate)
      }
    }

    void initPlayer()

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
