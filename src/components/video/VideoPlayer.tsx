import React, { useEffect, useRef, useState } from 'react'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'
import Player from '@vimeo/player'
import type { VideoQuality } from '@/types/video'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { VimeoPlayer } from './VideoPlayer/VimeoPlayer'
import MobilePlayer from './VideoPlayer/MobilePlayer'
import VideoControls from './VideoPlayer/VideoControls'
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
  const { isMobile } = useDeviceDetection()
  const containerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<Player | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPiPActive, setIsPiPActive] = useState(false)
  const [previewTime, setPreviewTime] = useState<number | null>(null)
  const videoId = content.vimeo_id || ''

  // Initialize Vimeo player
  useEffect(() => {
    if (!containerRef.current || !videoId) return

    // Clean up previous instance
    if (playerInstanceRef.current) {
      playerInstanceRef.current.destroy()
    }

    // Create new player instance
    playerInstanceRef.current = new Player(containerRef.current, {
      id: videoId,
      width: '100%',
      height: '100%',
      controls: false,
      autoplay: false,
      muted: false,
      loop: false,
      responsive: true,
      dnt: true,
      speed: true,
    })

    // Set initial time if available
    if (startTime > 0) {
      playerInstanceRef.current.setCurrentTime(startTime)
    }

    return () => {
      playerInstanceRef.current?.destroy()
      playerInstanceRef.current = null
    }
  }, [videoId, startTime])

  // Use the custom hook to manage player state
  const playerState = useVideoPlayer(playerInstanceRef.current)
  
  // Handle fullscreen
  const handleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error('Fullscreen error:', err))
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error('Exit fullscreen error:', err))
    }
  }

  // Handle picture-in-picture mode
  const handlePiP = async () => {
    if (!document.pictureInPictureEnabled) return
    
    const video = containerRef.current?.querySelector('video')
    if (!video) return
    
    if (!document.pictureInPictureElement) {
      try {
        await video.requestPictureInPicture()
        setIsPiPActive(true)
      } catch (error) {
        console.error('PiP error:', error)
      }
    } else {
      try {
        await document.exitPictureInPicture()
        setIsPiPActive(false)
      } catch (error) {
        console.error('Exit PiP error:', error)
      }
    }
  }

  // Handle progress hover for seeking preview
  const handleProgressHover = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!playerState.duration) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const position = (event.clientX - rect.left) / rect.width
    setPreviewTime(position * playerState.duration)
  }

  // Forward progress updates to parent component
  useEffect(() => {
    if (playerState.currentTime > 0 && onProgress) {
      onProgress(playerState.currentTime)
    }
    
    // Check if video has completed
    if (playerState.currentTime > 0 && 
        playerState.duration > 0 && 
        playerState.currentTime >= playerState.duration - 1 &&
        onComplete) {
      onComplete()
    }
  }, [playerState.currentTime, playerState.duration, onProgress, onComplete])

  // Create synchronous wrappers for async functions
  const handleQualityChangeSync = (quality: VideoQuality) => {
    void playerState.handleQualityChange(quality);
  }

  // Use mobile player on mobile devices
  if (isMobile) {
    return (
      <MobilePlayer 
        content={content} 
        onProgress={onProgress}
        onComplete={onComplete}
      />
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video w-full bg-black"
    >
      {/* Vimeo player is initialized in the div */}
      <div className="absolute inset-0" />
      
      {/* Video controls */}
      <VideoControls
        onPlayPause={playerState.handlePlayPause}
        onFullscreen={handleFullscreen}
        onPiP={handlePiP}
        onQualityChange={handleQualityChangeSync}
        onSeek={playerState.handleSeek}
        onProgressHover={handleProgressHover}
        onProgressLeave={() => setPreviewTime(null)}
        isPlaying={playerState.isPlaying}
        isFullscreen={isFullscreen}
        isPiPActive={isPiPActive}
        currentQuality={playerState.currentQuality}
        availableQualities={playerState.availableQualities}
        currentTime={playerState.currentTime}
        duration={playerState.duration}
      />
      
      {/* Preview thumbnail */}
      {previewTime !== null && (
        <div 
          className="absolute top-0 transform -translate-x-1/2 bg-black p-1 rounded"
          style={{
            left: `${(previewTime / playerState.duration) * 100}%`,
            opacity: 0.8
          }}
        >
          <div className="text-xs text-white">
            {Math.floor(previewTime / 60)}:{Math.floor(previewTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}
    </div>
  )
}
