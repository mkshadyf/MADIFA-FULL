'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { initializeStream } from '@/lib/services/streaming'
import { trackProgress } from '@/lib/services/content-delivery'
import type { Content } from '@/lib/types/content'
import type { StreamConfig } from '@/lib/types/streaming'
import Hls from 'hls.js'

interface VideoPlayerProps {
  content: Content
  onProgress?: (progress: number) => void
  onComplete?: () => void
  initialQuality?: '480p' | '720p' | '1080p'
  startTime?: number
}

export default function VideoPlayer({
  content,
  onProgress,
  onComplete,
  initialQuality = '1080p',
  startTime = 0
}: VideoPlayerProps) {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [quality, setQuality] = useState(initialQuality)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initPlayer = async () => {
      if (!user || !videoRef.current) return

      try {
        const config: StreamConfig = {
          quality,
          format: 'hls',
          drm: {
            type: 'widevine',
            licenseUrl: '/api/drm/license'
          }
        }

        const manifest = await initializeStream(content.id, config)

        if (Hls.isSupported()) {
          hlsRef.current = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            enableWorker: true,
            lowLatencyMode: true
          })

          hlsRef.current.loadSource(manifest.playbackUrl)
          hlsRef.current.attachMedia(videoRef.current)

          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            if (videoRef.current) {
              videoRef.current.currentTime = startTime
              setLoading(false)
            }
          })

          hlsRef.current.on(Hls.Events.ERROR, (_event: any, data: { fatal: boolean }) => {
            if (data.fatal) {
              setError('Video playback error')
            }
          })
        } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          videoRef.current.src = manifest.playbackUrl
          videoRef.current.currentTime = startTime
          setLoading(false)
        }
      } catch (error) {
        console.error('Player initialization error:', error)
        setError('Failed to initialize player')
      }
    }

    initPlayer()

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [content.id, quality, user])

  useEffect(() => {
    // Save progress periodically
    const progressInterval = setInterval(() => {
      if (videoRef.current && isPlaying && user) {
        const progress = videoRef.current.currentTime
        onProgress?.(progress)
        trackProgress(content.id, progress, duration)
      }
    }, 5000)

    return () => clearInterval(progressInterval)
  }, [content.id, duration, isPlaying, user])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      
      // Check if video is complete
      if (videoRef.current.currentTime >= videoRef.current.duration - 1) {
        onComplete?.()
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleQualityChange = async (newQuality: '480p' | '720p' | '1080p') => {
    setQuality(newQuality)
    setLoading(true)
    // Player will reinitialize with new quality due to useEffect dependency
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <video
        ref={videoRef}
        className="w-full aspect-video bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Video Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col space-y-2">
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
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
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

              {/* Time Display */}
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Quality Selection */}
            <select
              value={quality}
              onChange={(e) => handleQualityChange(e.target.value as '480p' | '720p' | '1080p')}
              className="bg-transparent text-white text-sm"
            >
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
} 