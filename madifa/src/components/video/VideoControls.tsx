import React, { useState, useEffect } from 'react'
import { IconButton } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { formatDuration } from '@/lib/utils/format'
import type { VideoQuality } from '@/types/vimeo'
import QualitySelector from './QualitySelector'

interface VideoControlsProps {
  onPlayPause: () => void
  onFullscreen: () => void
  onPiP: () => void
  onQualityChange: (quality: VideoQuality) => void
  onSeek: (time: number) => void
  onProgressHover: (event: React.MouseEvent<HTMLDivElement>) => void
  onProgressLeave: () => void
  isPlaying: boolean
  isFullscreen: boolean
  isPiPActive: boolean
  currentQuality: VideoQuality
  availableQualities: VideoQuality[]
  currentTime: number
  duration: number
}

export default function VideoControls({
  onPlayPause,
  onFullscreen,
  onPiP,
  onQualityChange,
  onSeek,
  onProgressHover,
  onProgressLeave,
  isPlaying,
  isFullscreen,
  isPiPActive,
  currentQuality,
  availableQualities,
  currentTime,
  duration
}: VideoControlsProps) {
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout>()

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
      const timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
      setControlsTimeout(timeout)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [isPlaying])

  return (
    <div 
      className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300
        ${showControls ? 'opacity-100' : 'opacity-0'}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        {/* Progress bar */}
        <div 
          className="relative group"
          onMouseMove={onProgressHover}
          onMouseLeave={onProgressLeave}
        >
          <Slider
            value={[currentTime]}
            max={duration}
            onValueChange={(values) => onSeek(values[0])}
            className="h-1 bg-gray-600 group-hover:h-2 transition-all"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <IconButton
              icon={isPlaying ? 'pause' : 'play'}
              onClick={onPlayPause}
              className="text-white hover:text-indigo-400"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            />
            
            <div className="text-sm text-white">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <QualitySelector
              currentQuality={currentQuality}
              availableQualities={availableQualities}
              onChange={onQualityChange}
            />

            <IconButton
              icon="pip"
              onClick={onPiP}
              className={`text-white hover:text-indigo-400 ${
                isPiPActive ? 'text-indigo-400' : ''
              }`}
              disabled={!document.pictureInPictureEnabled}
              aria-label={isPiPActive ? 'Exit picture in picture' : 'Enter picture in picture'}
            />

            <IconButton
              icon={isFullscreen ? 'minimize' : 'maximize'}
              onClick={onFullscreen}
              className={`text-white hover:text-indigo-400 ${
                isFullscreen ? 'text-indigo-400' : ''
              }`}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 