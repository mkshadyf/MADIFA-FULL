import React, { useEffect, useState } from 'react'

import { formatDuration } from '@/lib/utils/format'
import { useDoubleTap } from '@/hooks/useDoubleTap'
import { useSwipe } from '@/hooks/useSwipe'

export type VideoQuality =
  | 'auto'
  | '4k'
  | '2k'
  | '1080p'
  | '720p'
  | '540p'
  | '360p'

import { IconButton } from '../ui/button'
import { Slider } from '../ui/Slider'

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
  volume,
}: MobileVideoControlsProps) {
  const [showControls, setShowControls] = useState(true)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [seekPreview, setSeekPreview] = useState<{
    time: number
    visible: boolean
  }>({
    time: 0,
    visible: false,
  })

  const { bind: doubleTapBind } = useDoubleTap({
    onDoubleTap: () => {
      onPlayPause()
    },
  })

  const { bind: swipeBind } = useSwipe({
    onSwipeLeft: distance => {
      const seekTime = Math.min(duration, currentTime - (distance / 100) * 10)
      onSeek(seekTime)
    },
    onSwipeRight: distance => {
      const seekTime = Math.max(0, currentTime + (distance / 100) * 10)
      onSeek(seekTime)
    },
    onSwipeUp: distance => {
      const newVolume = Math.min(1, volume + distance / 100)
      onVolumeChange(newVolume)
    },
    onSwipeDown: distance => {
      const newVolume = Math.max(0, volume - distance / 100)
      onVolumeChange(newVolume)
    },
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
          <div className="text-center text-sm text-white/50">
            Double tap to play/pause
            <br />
            Swipe for seek/volume
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {showControls ? (
        <div className="absolute inset-0 bg-black/40">
          {/* Top bar */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-4">
            <div className="text-sm text-white">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
            <IconButton
              label={isFullscreen ? 'Minimize' : 'Maximize'}
              icon={isFullscreen ? 'minimize' : 'maximize'}
              onClick={onFullscreen}
              className="text-white"
            />
          </div>

          {/* Center play/pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <IconButton
              label={isPlaying ? 'Pause' : 'Play'}
              icon={isPlaying ? 'pause' : 'play'}
              onClick={onPlayPause}
              className="text-6xl text-white"
            />
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Slider
              value={[currentTime]}
              max={duration}
              onValueChange={([time]) => onSeek(time)}
              className="mb-4"
              label="Video progress"
              ariaLabel="Video progress slider"
            />

            {/* Quality selector */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="rounded bg-black/40 px-2 py-1 text-sm text-white"
              >
                {currentQuality}
              </button>
            </div>

            {showQualityMenu ? (
              <div className="absolute bottom-16 right-4 overflow-hidden rounded-lg bg-black/90">
                {availableQualities.map(quality => (
                  <button
                    key={quality}
                    onClick={() => {
                      onQualityChange(quality)
                      setShowQualityMenu(false)
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      quality === currentQuality
                        ? 'bg-indigo-600 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Seek preview */}
      {seekPreview.visible ? (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 transform rounded bg-black/90 px-2 py-1 text-sm text-white">
          {formatDuration(seekPreview.time)}
        </div>
      ) : null}
    </div>
  )
}
