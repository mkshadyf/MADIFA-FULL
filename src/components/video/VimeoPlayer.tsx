import React from "react"
import { useCallback, useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'


import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics'
import { useVideoSubscription } from '@/hooks/useVideoSubscription'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'

import BufferingIndicator from './BufferingIndicator'
import type { VideoQuality } from '@/types/video'
import type { VimeoPlayer, VimeoPlayerOptions, VimeoTimeUpdateEvent, VimeoProgressEvent } from '@/types/vimeo'

interface VimeoPlayerProps {
  videoId: string
  thumbnailUrl?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  responsive?: boolean
  speed?: boolean
  title?: boolean
  byline?: boolean
  portrait?: boolean
  quality?: VideoQuality
  startTime?: number
  requiresSubscription?: boolean
  onError?: (error: Error) => void
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onProgress?: (progress: number) => void
  onQualityChange?: (quality: VideoQuality) => void
}

export function VimeoPlayer({
  videoId,
  thumbnailUrl,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  responsive = true,
  speed = true,
  title = false,
  byline = false,
  portrait = false,
  quality = 'auto',
  startTime = 0,
  requiresSubscription = false,
  onError,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onTimeUpdate,
  onProgress,
  onQualityChange,
}: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<VimeoPlayer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const {
    currentTime,
    duration,
    handleQualityChange: handleQualityChangeInternal,
  } = useVideoPlayer(player)

  const { hasAccess, isLoading: isCheckingSubscription, error: subscriptionError } = useVideoSubscription(requiresSubscription)

  useEffect(() => {
    if (subscriptionError) {
      setHasError(true)
      onError?.(subscriptionError)
    }
  }, [subscriptionError, onError])

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime)
    }
  }, [currentTime, onTimeUpdate])

  useEffect(() => {
    if (onProgress && duration > 0) {
      onProgress(currentTime / duration)
    }
  }, [currentTime, duration, onProgress])

  useVideoAnalytics(player, videoId)

  useEffect(() => {
    if (!playerRef.current || !hasAccess) return

    const options: VimeoPlayerOptions = {
      id: parseInt(videoId, 10),
      autopause: false,
      autoplay,
      loop,
      muted,
      controls,
      responsive,
      speed,
      title,
      byline,
      portrait,
      quality,
    }

    const vimeoPlayer = new Player(playerRef.current, options) as VimeoPlayer

    setPlayer(vimeoPlayer)

    const handlePlayerError = (error: Error) => {
      console.error('Video player error:', error)
      setHasError(true)
        setIsLoading(false)
      onError?.(error)
    }

    const handlePlayerReady = async () => {
      setIsLoading(false)
      if (startTime > 0) {
        try {
          await vimeoPlayer.setCurrentTime(startTime)
        } catch (error) {
          console.error('Error setting start time:', error)
        }
      }
      onReady?.()
    }

    const handlePlayerPlay = () => {
      onPlay?.()
    }

    const handlePlayerPause = () => {
      onPause?.()
    }

    const handlePlayerEnd = () => {
      onEnd?.()
    }

    const handlePlayerTimeUpdate = (data: VimeoTimeUpdateEvent) => {
      if (onTimeUpdate) {
        onTimeUpdate(data.seconds)
      }
    }

    const handlePlayerProgress = (data: VimeoProgressEvent) => {
      if (onProgress) {
        onProgress(data.percent)
      }
    }

    void vimeoPlayer.ready().then(handlePlayerReady).catch(handlePlayerError)

    vimeoPlayer.on('play', handlePlayerPlay)
    vimeoPlayer.on('pause', handlePlayerPause)
    vimeoPlayer.on('ended', handlePlayerEnd)
    vimeoPlayer.on('timeupdate', handlePlayerTimeUpdate)
    vimeoPlayer.on('progress', handlePlayerProgress)

    return () => {
      vimeoPlayer.off('play', handlePlayerPlay)
      vimeoPlayer.off('pause', handlePlayerPause)
      vimeoPlayer.off('ended', handlePlayerEnd)
      vimeoPlayer.off('timeupdate', handlePlayerTimeUpdate)
      vimeoPlayer.off('progress', handlePlayerProgress)
      vimeoPlayer.destroy()
    }
  }, [
    videoId,
    autoplay,
    loop,
    muted,
    controls,
    responsive,
    speed,
    title,
    byline,
    portrait,
    quality,
    startTime,
    hasAccess,
    onError,
    onReady,
    onPlay,
    onPause,
    onEnd,
    onTimeUpdate,
    onProgress,
  ])

  const handleQualityChangeWrapper = useCallback(
    async (newQuality: VideoQuality) => {
      try {
        await handleQualityChangeInternal(newQuality)
        onQualityChange?.(newQuality)
      } catch (error) {
        console.error('Error changing quality:', error)
        onError?.(error as Error)
      }
    },
    [handleQualityChangeInternal, onQualityChange, onError]
  )

  useEffect(() => {
    if (quality && handleQualityChangeWrapper) {
      void handleQualityChangeWrapper(quality).catch(error => {
        console.error('Error setting initial quality:', error)
        onError?.(error as Error)
      })
    }
  }, [quality, handleQualityChangeWrapper, onError])

  if (isCheckingSubscription) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <LoadingSpinner className="h-12 w-12 text-primary" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-black p-4 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">Premium Content</h2>
        <p className="mb-6 text-gray-300">This content requires an active subscription.</p>
        <a href="/subscription" className="rounded-md bg-primary px-6 py-2 text-white hover:bg-primary/90">
          Subscribe Now
        </a>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="text-center text-white">
          <p className="mb-4">Failed to load video</p>
          <Button
            onClick={() => {
              if (typeof globalThis !== 'undefined') {
                globalThis.location.reload()
              }
            }}
            variant="primary"
            >
              Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={playerRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="h-full w-full object-contain"
            />
          ) : (
            <LoadingSpinner className="h-12 w-12 text-primary" />
          )}
        </div>
      )}
      <BufferingIndicator isBuffering={isLoading} />
    </div>
  )
}
