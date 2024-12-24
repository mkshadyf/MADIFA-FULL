import React, { useCallback, useEffect, useRef, useState } from 'react'

interface VideoProgressProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
}

export default function VideoProgress({
  currentTime,
  duration,
  onSeek,
  className = '',
}: VideoProgressProps) {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewTime, setPreviewTime] = useState(currentTime)
  const [showTooltip, setShowTooltip] = useState(false)

  const calculateTimeFromEvent = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current) return 0

      const rect = progressBarRef.current.getBoundingClientRect()
      const position = (clientX - rect.left) / rect.width
      return Math.max(0, Math.min(position * duration, duration))
    },
    [duration]
  )

  const handleInteraction = useCallback(
    (clientX: number) => {
      const newTime = calculateTimeFromEvent(clientX)
      if (!isDragging) {
        onSeek(newTime)
      }
      setPreviewTime(newTime)
    },
    [calculateTimeFromEvent, isDragging, onSeek]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging && e.buttons !== 1) return
      handleInteraction(e.clientX)
    },
    [handleInteraction, isDragging]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault()
      handleInteraction(e.touches[0].clientX)
    },
    [handleInteraction]
  )

  useEffect(() => {
    if (!isDragging) {
      setPreviewTime(currentTime)
    }
  }, [currentTime, isDragging])

  useEffect(() => {
    const progressBar = progressBarRef.current
    if (!progressBar) return

    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)
    const handleTouchStart = () => setIsDragging(true)
    const handleTouchEnd = () => setIsDragging(false)

    progressBar.addEventListener('mousemove', handleMouseMove)
    progressBar.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    })
    progressBar.addEventListener('mousedown', handleMouseDown)
    progressBar.addEventListener('mouseup', handleMouseUp)
    progressBar.addEventListener('mouseleave', handleMouseUp)
    progressBar.addEventListener('touchstart', handleTouchStart)
    progressBar.addEventListener('touchend', handleTouchEnd)

    return () => {
      progressBar.removeEventListener('mousemove', handleMouseMove)
      progressBar.removeEventListener('touchmove', handleTouchMove)
      progressBar.removeEventListener('mousedown', handleMouseDown)
      progressBar.removeEventListener('mouseup', handleMouseUp)
      progressBar.removeEventListener('mouseleave', handleMouseUp)
      progressBar.removeEventListener('touchstart', handleTouchStart)
      progressBar.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleMouseMove, handleTouchMove])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="min-w-[40px] select-none text-sm text-white">
        {formatTime(currentTime)}
      </span>
      <div
        ref={progressBarRef}
        className="group relative flex-1"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="slider"
        aria-label="Video progress"
         aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        tabIndex={0}
      >
        <div className="h-1 cursor-pointer rounded-full bg-gray-700">
          <div
            className="absolute h-full rounded-full bg-indigo-500 transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className={`absolute -top-1.5 -ml-2 h-4 w-4 rounded-full bg-indigo-500 transition-opacity duration-200 ${
              showTooltip || isDragging ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ left: `${(previewTime / duration) * 100}%` }}
          />
        </div>
        {showTooltip ? (
          <div
            className="pointer-events-none absolute bottom-6 -translate-x-1/2 transform rounded bg-black/90 px-2 py-1 text-sm text-white"
            style={{ left: `${(previewTime / duration) * 100}%` }}
          >
            {formatTime(previewTime)}
          </div>
        ) : null}
      </div>
      <span className="min-w-[40px] select-none text-sm text-white">
        {formatTime(duration)}
      </span>
    </div>
  )
}
