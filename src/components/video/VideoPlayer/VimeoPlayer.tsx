import Player from '@vimeo/player'
import React, { useEffect, useRef } from 'react'
import type { VideoQuality } from './useVideoPlayer'

interface VimeoPlayerProps {
  videoId: string
  autoplay?: boolean
  onProgress: (progress: number) => void
  onEnded?: () => void
  onError?: (error: Error) => void
  volume: number
  playbackRate: number
  quality: VideoQuality
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  videoId,
  autoplay = false,
  onProgress,
  onEnded,
  onError,
  volume,
  playbackRate,
  quality,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<Player | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    playerRef.current = new Player(containerRef.current, {
      id: videoId,
      autoplay,
      loop: false,
      muted: false,
      controls: false,
    })

    playerRef.current.on('timeupdate', async (data: { seconds: number }) => {
      const duration = (await playerRef.current?.getDuration()) || 0
      onProgress(data.seconds / duration)
    })

    playerRef.current.on('ended', () => {
      onEnded?.()
    })

    playerRef.current.on('error', (error: Error) => {
      onError?.(error)
    })

    return () => {
      playerRef.current?.destroy()
    }
  }, [videoId, autoplay, onProgress, onEnded, onError])

  useEffect(() => {
    playerRef.current?.setVolume(volume)
  }, [volume])

  useEffect(() => {
    playerRef.current?.setPlaybackRate(playbackRate)
  }, [playbackRate])

  useEffect(() => {
    playerRef.current?.setQuality(quality.replace('p', ''))
  }, [quality])

  return <div ref={containerRef} className="h-full w-full" />
}
