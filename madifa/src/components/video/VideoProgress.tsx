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
  className = ''
}: VideoProgressProps) {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewTime, setPreviewTime] = useState(currentTime)
  const [showTooltip, setShowTooltip] = useState(false)

  const calculateTimeFromEvent = useCallback((clientX: number) => {
    if (!progressBarRef.current) return 0

    const rect = progressBarRef.current.getBoundingClientRect()
    const position = (clientX - rect.left) / rect.width
    return Math.max(0, Math.min(position * duration, duration))
  }, [duration])

  const handleInteraction = useCallback((clientX: number) => {
    const newTime = calculateTimeFromEvent(clientX)
    if (!isDragging) {
      onSeek(newTime)
    }
    setPreviewTime(newTime)
  }, [calculateTimeFromEvent, isDragging, onSeek])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return
    handleInteraction(e.clientX)
  }, [handleInteraction, isDragging])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleInteraction(e.touches[0].clientX)
  }, [handleInteraction])

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
    progressBar.addEventListener('touchmove', handleTouchMove, { passive: false })
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
      <span className="text-sm text-white select-none min-w-[40px]">
        {formatTime(currentTime)}
      </span>
      <div 
        ref={progressBarRef}
        className="relative flex-1 group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role="slider"
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        tabIndex={0}
      >
        <div className="h-1 bg-gray-700 rounded-full cursor-pointer">
          <div
            className="absolute h-full bg-indigo-500 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div 
            className={`absolute h-4 w-4 bg-indigo-500 rounded-full -top-1.5 -ml-2 transition-opacity duration-200 ${
              showTooltip || isDragging ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ left: `${(previewTime / duration) * 100}%` }}
          />
        </div>
        {showTooltip && (
          <div 
            className="absolute bottom-6 bg-black/90 text-white px-2 py-1 rounded text-sm transform -translate-x-1/2 pointer-events-none"
            style={{ left: `${(previewTime / duration) * 100}%` }}
          >
            {formatTime(previewTime)}
          </div>
        )}
      </div>
      <span className="text-sm text-white select-none min-w-[40px]">
        {formatTime(duration)}
      </span>
    </div>
  )
} 