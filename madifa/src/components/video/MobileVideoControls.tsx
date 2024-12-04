import React, { useState, useEffect } from 'react'
import { IconButton } from '../ui/button'
import { Slider } from '../ui/slider'
import { formatDuration } from '@/lib/utils/format'
import type { VideoQuality } from '@/types/vimeo'
import { useDoubleTap } from '@/hooks/useDoubleTap'
import { useSwipe } from '@/hooks/useSwipe'

interface MobileVideoControlsProps {
  onPlayPause: () => void
  onFullscreen: () => void
  onQualityChange: (quality: VideoQuality) => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  isPlaying: boolean
  isFullscreen: boolean
  currentQuality: VideoQuality
  availableQualities: VideoQuality[]
  currentTime: number
  duration: number
  volume: number
}

export default function MobileVideoControls({
  onPlayPause,
  onFullscreen,
  onQualityChange,
  onSeek,
  onVolumeChange,
  isPlaying,
  isFullscreen,
  currentQuality,
  availableQualities,
  currentTime,
  duration,
  volume
}: MobileVideoControlsProps) {
  const [showControls, setShowControls] = useState(true)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [seekPreview, setSeekPreview] = useState<{ time: number; visible: boolean }>({
    time: 0,
    visible: false
  })

  const { bind: doubleTapBind } = useDoubleTap(() => {
    onPlayPause()
  })

  const { bind: swipeBind } = useSwipe({
    onSwipeLeft: (distance) => {
      const seekTime = Math.min(duration, currentTime - (distance / 100) * 10)
      onSeek(seekTime)
    },
    onSwipeRight: (distance) => {
      const seekTime = Math.max(0, currentTime + (distance / 100) * 10)
      onSeek(seekTime)
    },
    onSwipeUp: (distance) => {
      const newVolume = Math.min(1, volume + (distance / 100))
      onVolumeChange(newVolume)
    },
    onSwipeDown: (distance) => {
      const newVolume = Math.max(0, volume - (distance / 100))
      onVolumeChange(newVolume)
    }
  })

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showControls && isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, isPlaying])

  return (
    <div 
      className="absolute inset-0 touch-none"
      {...doubleTapBind}
      {...swipeBind}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Gesture hints */}
      {!showControls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50 text-sm text-center">
            Double tap to play/pause<br />
            Swipe for seek/volume
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/40">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="text-white text-sm">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
            <IconButton
              icon={isFullscreen ? 'minimize' : 'maximize'}
              onClick={onFullscreen}
              className="text-white"
            />
          </div>

          {/* Center play/pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              onClick={onPlayPause}
              className="text-white text-6xl"
            />
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Slider
              value={currentTime}
              max={duration}
              onChange={onSeek}
              onPreview={(time) => setSeekPreview({ time, visible: true })}
              onPreviewEnd={() => setSeekPreview({ time: 0, visible: false })}
              className="mb-4"
            />
            
            {/* Quality selector */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="text-white text-sm px-2 py-1 rounded bg-black/40"
              >
                {currentQuality}
              </button>
            </div>

            {showQualityMenu && (
              <div className="absolute bottom-16 right-4 bg-black/90 rounded-lg overflow-hidden">
                {availableQualities.map((quality) => (
                  <button
                    key={quality}
                    onClick={() => {
                      onQualityChange(quality)
                      setShowQualityMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-sm text-left ${
                      quality === currentQuality
                        ? 'bg-indigo-600 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seek preview */}
      {seekPreview.visible && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-white text-sm">
          {formatDuration(seekPreview.time)}
        </div>
      )}
    </div>
  )
} 