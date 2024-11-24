'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import type { Content } from '@/lib/types/content'
import { trackProgress } from '@/lib/services/content-delivery'

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
  onComplete
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onProgress?.(video.currentTime)

      // Track progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        trackProgress(content.id, video.currentTime, video.duration)
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
  }, [content.id, startTime, onProgress, onComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setVolume(value)
    if (videoRef.current) {
      videoRef.current.volume = value
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
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
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  return (
    <div 
      className="relative group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={content.video_url}
        className="w-full aspect-video bg-black"
        onClick={togglePlay}
      />

      {/* Video Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Progress Bar */}
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause Button */}
              <button onClick={togglePlay} className="text-white hover:text-gray-300">
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14.4c1.5-1.4 2.5-3.4 2.5-5.4 0-2-.9-4-2.5-5.4l-1.5 1.5c1.1 1.1 1.9 2.6 1.9 3.9s-.7 2.8-1.9 3.9l1.5 1.5zM12 16.5l-3.9-3.9H3v-3h5.1L12 5.7v10.8z" />
                </svg>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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