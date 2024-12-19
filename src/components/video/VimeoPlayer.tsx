import React, { useCallback, useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'

import type { VideoQuality, VimeoPlayer } from '@/types/vimeo'
import { handleVideoError } from '@/lib/utils/video-errors'
import { useAuth } from '@/hooks/useAuth'
import { useVideoAds } from '@/hooks/useVideoAds'
import { useVideoAnalytics } from '@/hooks/useVideoAnalytics'
import { useVideoControls } from '@/hooks/useVideoControls'
import { useVideoKeyboard } from '@/hooks/useVideoKeyboard'
import { useVideoProgress } from '@/hooks/useVideoProgress'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

import BufferingIndicator from './BufferingIndicator'
import ThumbnailPreview from './ThumbnailPreview'
import VideoControls from './VideoControls'

interface VimeoPlayerProps {
  videoId: string
  title?: string
  className?: string
}

export default function VimeoPlayer ({ videoId, title, className = '' }: VimeoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<VimeoPlayer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiPActive, setIsPiPActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('auto')
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([])
  const { profile } = useAuth()
  const [isBuffering, setIsBuffering] = useState(false)
  const [previewData, setPreviewData] = useState<{
    visible: boolean
    time: number
    position: { x: number; y: number }
  }>({
    visible: false,
    time: 0,
    position: { x: 0, y: 0 },
  })

  const { currentTime, duration, handleSeek } = useVideoProgress(player)
  const { handleQualityChange } = useVideoControls(player)
  useVideoAnalytics(player, videoId)
  useVideoAds({
    player,
    isSubscribed: profile?.subscription_tier !== 'free',
    videoId,
  })
  useVideoKeyboard({
    player,
    onToggleFullscreen: () => handleFullscreen(),
    onTogglePiP: () => handlePiP(),
  })

  useEffect(() => {
    if (!playerRef.current) return

    const vimeoPlayer = new Player(playerRef.current, {
      id: videoId,
      autopause: false,
      background: false,
      controls: false,
      keyboard: true,
      pip: true,
      playsinline: true,
      responsive: true,
      speed: true,
      transparent: false,
      quality: currentQuality,
    }) as VimeoPlayer

    setPlayer(vimeoPlayer)

    vimeoPlayer.ready().then(async () => {
      try {
        const qualities = await vimeoPlayer.getQualities()
        setAvailableQualities(qualities)
        setIsLoading(false)
      } catch (err) {
        const error = handleVideoError(err)
        setError(error)
        setIsLoading(false)
      }
    })

    return () => {
      vimeoPlayer.destroy()
    }
  }, [videoId, currentQuality])

  useEffect(() => {
    if (!player) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoading = () => setIsLoading(true)
    const handleLoaded = () => setIsLoading(false)
    const handleError = (err: Error) => {
      logger.error('Vimeo player error:', err)
      setError(err)
      setIsLoading(false)
    }

    player.on('play', handlePlay)
    player.on('pause', handlePause)
    player.on('bufferstart', handleLoading)
    player.on('bufferend', handleLoaded)
    player.on('error', handleError)

    return () => {
      player.off('play', handlePlay)
      player.off('pause', handlePause)
      player.off('bufferstart', handleLoading)
      player.off('bufferend', handleLoaded)
      player.off('error', handleError)
    }
  }, [player])

  useEffect(() => {
    if (!player) return

    const handleBufferStart = () => setIsBuffering(true)
    const handleBufferEnd = () => setIsBuffering(false)
    const handlePlaying = () => setIsBuffering(false)

    player.on('bufferstart', handleBufferStart)
    player.on('bufferend', handleBufferEnd)
    player.on('playing', handlePlaying)

    return () => {
      player.off('bufferstart', handleBufferStart)
      player.off('bufferend', handleBufferEnd)
      player.off('playing', handlePlaying)
    }
  }, [player])

  const handlePlayPause = async () => {
    if (!player) return
    try {
      if (isPlaying) {
        await player.pause()
      } else {
        await player.play()
      }
    } catch (err) {
      logger.error('Error toggling play state:', err)
    }
  }

  const handleFullscreen = async () => {
    if (!playerRef.current) return

    try {
      if (!isFullscreen) {
        if (playerRef.current.requestFullscreen) {
          await playerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
      setIsFullscreen(!isFullscreen)
    } catch (err) {
      logger.error('Error toggling fullscreen:', err)
    }
  }

  const handlePiP = async () => {
    if (!player) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPiPActive(false)
      } else if (playerRef.current) {
        video')
        if (video) {
          await video.requestPictureInPicture()
          setIsPiPActive(true)
        }
      }
    } catch (err) {
      logger.error('Error toggling PiP:', err)
    }
  }

  const handlePreviewHover = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const position = {
        x: event.clientX - rect.left,
        y: rect.top,
      }
      const time = (position.x / rect.width) * duration

      setPreviewData({
        visible: true,
        time,
        position,
      })
    },
    [duration]
  )

  if (error) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-2 text-red-500">Failed to load video</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-lg bg-gray-900 ${className}`}
      ref={playerRef}
    >
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <LoadingState />
        </div>
      ) : null}

      <BufferingIndicator isBuffering={isBuffering} />

      <ThumbnailPreview
        thumbnailUrl={thumbnailUrl}
        time={previewData.time}
        position={previewData.position}
        visible={previewData.visible}
      />

      <VideoControls
        onPlayPause={handlePlayPause}
        onFullscreen={handleFullscreen}
        onPiP={handlePiP}
        onQualityChange={handleQualityChange}
        isPlaying={isPlaying}
        isFullscreen={isFullscreen}
        isPiPActive={isPiPActive}
        currentQuality={currentQuality}
        availableQualities={availableQualities}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        onProgressHover={handlePreviewHover}
        onProgressLeave={() => setPreviewData(prev => ({ ...prev, visible: false }))}
      />
    </div>
  )
}
