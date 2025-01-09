import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Slider } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { trackProgress } from '@/lib/services/content-delivery'
import type { Content } from '@/types/content'

interface VideoPlayerProps {
  content: Content
  startTime?: number
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export default function VideoPlayer({
  content,
  startTime = 0,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<number>()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onProgress?.(video.currentTime)

      // Track progress every 10 seconds if user is authenticated
      if (user && Math.floor(video.currentTime) % 10 === 0) {
        const timestamp = Math.floor(Date.now() / 1000)
        void trackProgress(content.id, user.id, video.currentTime, timestamp)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      video.currentTime = startTime
    }

    const handleEnded = () => {
      onComplete?.()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
    }
  }, [content.id, startTime, onProgress, onComplete, user])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      void video.play()
      setIsPlaying(true)
    } else {
      void video.pause()
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (values: number[]) => {
    const value = values[0]
    setVolume(value)
    if (videoRef.current) {
      videoRef.current.volume = value
    }
  }

  const handleSeek = (values: number[]) => {
    const time = values[0]
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div
      className="group relative"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={content.video_url ?? ''}
        className="aspect-video w-full bg-black"
        onClick={togglePlay}
      />

      {/* Video Controls */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute bottom-0 left-0 right-0 space-y-4 p-4">
          {/* Progress Bar */}
          <Slider
            value={[currentTime]}
            max={duration}
            onValueChange={handleSeek}
            className="h-1 bg-gray-600 transition-all group-hover:h-2"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300"
                title="Play/Pause"
              >
                {isPlaying ? (
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Time Display */}
              <div className="text-sm text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <svg
                  className="h-6 w-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M15.5 14.4c1.5-1.4 2.5-3.4 2.5-5.4 0-2-.9-4-2.5-5.4l-1.5 1.5c1.1 1.1 1.9 2.6 1.9 3.9s-.7 2.8-1.9 3.9l1.5 1.5zM12 16.5l-3.9-3.9H3v-3h5.1L12 5.7v10.8z" />
                </svg>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              <button
                title="Go back to home"
                onClick={() => navigate('/')}
                className="text-white hover:text-gray-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
