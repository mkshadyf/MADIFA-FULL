'use client'

import { useEffect, useRef, useState } from 'react'
import { useDeviceDetection } from '@/lib/hooks/useDeviceDetection'
import { useSwipeable } from 'react-swipeable'
import type { Content } from '@/lib/types/content'

interface MobileVideoPlayerProps {
  content: Content
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export default function MobileVideoPlayer({
  content,
  onProgress,
  onComplete
}: MobileVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { orientation, touchEnabled } = useDeviceDetection()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Handle swipe gestures
  const handlers = useSwipeable({
    onSwipeLeft: () => {
      if (videoRef.current) {
        videoRef.current.currentTime += 10 // Forward 10 seconds
      }
    },
    onSwipeRight: () => {
      if (videoRef.current) {
        videoRef.current.currentTime -= 10 // Rewind 10 seconds
      }
    },
    onSwipeUp: () => {
      if (videoRef.current) {
        videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1)
      }
    },
    onSwipeDown: () => {
      if (videoRef.current) {
        videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1)
      }
    }
  })

  // Handle double tap for play/pause
  const handleDoubleTap = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    const showControlsTemporarily = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    if (videoRef.current) {
      videoRef.current.addEventListener('touchstart', showControlsTemporarily)
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('touchstart', showControlsTemporarily)
      }
      clearTimeout(timeout)
    }
  }, [])

  return (
    <div 
      className={`relative ${orientation === 'landscape' ? 'h-screen' : 'aspect-video'}`}
      {...handlers}
    >
      <video
        ref={videoRef}
        src={content.video_url}
        className="w-full h-full object-contain bg-black"
        playsInline
        controls={showControls}
        onProgress={() => {
          if (videoRef.current) {
            onProgress?.(videoRef.current.currentTime)
          }
        }}
        onEnded={() => {
          onComplete?.()
        }}
      />

      {/* Custom mobile controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleDoubleTap}
              className="text-white text-2xl"
            >
              {videoRef.current?.paused ? '▶️' : '⏸️'}
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white text-xl"
            >
              {isFullscreen ? '↙️' : '↗️'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 