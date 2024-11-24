'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { initializeStream } from '@/lib/services/streaming'
import { trackProgress } from '@/lib/services/content-delivery'
import type { Tables } from '@/types/supabase'
import type { VideoPlayerInstance } from '@/types/video'
import { createVideoPlayer, destroyVideoPlayer, loadSource } from '@/lib/services/video-player'
import { useAds } from '@/lib/hooks/useAds'
import BannerAd from '@/components/ads/BannerAd'

interface VideoPlayerProps {
  content: Tables<'content'>['Row']
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
  const playerInstanceRef = useRef<VideoPlayerInstance | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [quality, setQuality] = useState(initialQuality)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const { showInterstitial, adsEnabled, getAdStats } = useAds()
  const [nextAdTime, setNextAdTime] = useState<number | null>(null)

  useEffect(() => {
    const initPlayer = async () => {
      if (!user || !videoRef.current) return

      try {
        const config = {
          quality,
          format: 'hls' as const,
          drm: {
            type: 'widevine' as const,
            licenseUrl: '/api/drm/license'
          }
        }

        const manifest = await initializeStream(content.id, config)
        
        playerInstanceRef.current = createVideoPlayer(videoRef.current)
        loadSource(playerInstanceRef.current, manifest.playbackUrl)

        videoRef.current.currentTime = startTime
        setLoading(false)
      } catch (error) {
        console.error('Player initialization error:', error)
        setError('Failed to initialize player')
      }
    }

    initPlayer()

    return () => {
      if (playerInstanceRef.current) {
        destroyVideoPlayer(playerInstanceRef.current)
      }
    }
  }, [content.id, quality, user, startTime])

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

  useEffect(() => {
    if (!playerRef.current || !adsEnabled) return

    const stats = getAdStats('interstitial')
    if (!stats.canShow) {
      setNextAdTime(Date.now() + (stats.timeUntilNext || 0))
      return
    }

    let adShown = false
    const showAdAfterDelay = async () => {
      if (!adShown && adsEnabled) {
        // Show ad after 5 minutes or at 25% of video duration
        const adTriggerTime = Math.min(5 * 60, duration * 0.25)
        if (currentTime >= adTriggerTime) {
          const shown = await showInterstitial()
          if (shown) {
            adShown = true
            const stats = getAdStats('interstitial')
            setNextAdTime(Date.now() + (stats.timeUntilNext || 0))
          }
        }
      }
    }

    const adCheckInterval = setInterval(showAdAfterDelay, 1000)

    return () => {
      clearInterval(adCheckInterval)
    }
  }, [adsEnabled, showInterstitial, currentTime, duration])

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

      {adsEnabled && nextAdTime && (
        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-sm">
          Next ad in: {Math.ceil((nextAdTime - Date.now()) / 1000)}s
        </div>
      )}

      {adsEnabled && <BannerAd />}
    </div>
  )
} 