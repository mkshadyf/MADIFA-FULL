import React, { useEffect, useRef, useState } from 'react'
import {
  createVideoPlayer,
  destroyVideoPlayer,
} from '@/lib/services/video-player'
import type { VideoQuality } from '@/types/video'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { DEFAULT_QUALITIES } from '@/types/video'

import VideoControls from './VideoControls'
import BufferingIndicator from './BufferingIndicator'
import type { VideoPlayerProps } from '@/types/video'

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  thumbnail,
  title,
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  quality = 'auto',
  startTime = 0,
  onError,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onTimeUpdate,

  onQualityChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>(quality)
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([
    ...DEFAULT_QUALITIES,
  ])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiPActive, setIsPiPActive] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const player = createVideoPlayer(videoRef.current, {
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      enableWorker: true,
      lowLatencyMode: true,
    })

    playerRef.current = player

    const handleError = (error: Error) => {
      console.error(error.message, 'video_player_error')
      setHasError(true)
      setIsLoading(false)
      onError?.(error)
    }

    const handleReady = () => {
      setIsLoading(false)
      if (startTime > 0) {
        videoRef.current!.currentTime = startTime
      }
      onReady?.()
    }

    const handleTimeUpdate = () => {
      const time = videoRef.current?.currentTime || 0
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }

    const handleDurationChange = () => {
      const newDuration = videoRef.current?.duration || 0
      setDuration(newDuration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnd?.()
    }

    videoRef.current.addEventListener('error', () =>
      handleError(new Error('Video playback error'))
    )
    videoRef.current.addEventListener('loadedmetadata', handleReady)
    videoRef.current.addEventListener('timeupdate', handleTimeUpdate)
    videoRef.current.addEventListener('durationchange', handleDurationChange)
    videoRef.current.addEventListener('play', handlePlay)
    videoRef.current.addEventListener('pause', handlePause)
    videoRef.current.addEventListener('ended', handleEnded)

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('error', () =>
          handleError(new Error('Video playback error'))
        )
        videoRef.current.removeEventListener('loadedmetadata', handleReady)
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        videoRef.current.removeEventListener(
          'durationchange',
          handleDurationChange
        )
        videoRef.current.removeEventListener('play', handlePlay)
        videoRef.current.removeEventListener('pause', handlePause)
        videoRef.current.removeEventListener('ended', handleEnded)
      }
      if (playerRef.current) {
        destroyVideoPlayer(playerRef.current)
      }
    }
  }, [url, startTime, onError, onReady, onTimeUpdate, onPlay, onPause, onEnd])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('enterpictureinpicture', handlePiPChange)
    document.addEventListener('leavepictureinpicture', handlePiPChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('enterpictureinpicture', handlePiPChange)
      document.removeEventListener('leavepictureinpicture', handlePiPChange)
    }
  }, [])

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleQualityChange = (newQuality: VideoQuality) => {
    setCurrentQuality(newQuality)
    onQualityChange?.(newQuality)
  }

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="text-center text-white">
          <p className="mb-4">Failed to load video</p>
          <Button onClick={() => window.location.reload()} variant="primary">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full">
      <video
        ref={videoRef}
        className="h-full w-full"
        poster={thumbnail}
        title={title}
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        playsInline
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="h-full w-full object-contain"
            />
          ) : (
            <LoadingSpinner className="h-12 w-12 text-primary" />
          )}
        </div>
      )}

      {controls && !isLoading && (
        <>
          <VideoControls
            isPlaying={isPlaying}
            currentQuality={currentQuality}
            availableQualities={availableQualities}
            currentTime={currentTime}
            duration={duration}
            isFullscreen={isFullscreen}
            isPiPActive={isPiPActive}
            onQualityChange={handleQualityChange}
            onPlayPause={() => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause()
                } else {
                  void videoRef.current.play()
                }
              }
            }}
            onFullscreen={() => {
              if (document.fullscreenElement) {
                void document.exitFullscreen()
              } else {
                void videoRef.current?.requestFullscreen()
              }
            }}
            onPiP={async () => {
              if (document.pictureInPictureElement) {
                await document.exitPictureInPicture()
              } else if (videoRef.current) {
                await videoRef.current.requestPictureInPicture()
              }
            }}
            onSeek={handleSeek}
            onProgressHover={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              const position = (e.clientX - rect.left) / rect.width
              setHoverTime(position * duration)
            }}
            onProgressLeave={() => setHoverTime(null)}
          />
        </>
      )}

      <BufferingIndicator isBuffering={isLoading} />
    </div>
  )
}
