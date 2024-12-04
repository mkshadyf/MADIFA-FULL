import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { VideoQuality } from '@/types/vimeo'

interface QualitySelectorProps {
  currentQuality: VideoQuality
  availableQualities: VideoQuality[]
  onChange: (quality: VideoQuality) => void
  className?: string
}

export default function QualitySelector({
  currentQuality,
  availableQualities,
  onChange,
  className = ''
}: QualitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
    if (event.key === 'Enter' || event.key === ' ') {
      setIsOpen(prev => !prev)
    }
  }, [])

  const formatQualityLabel = (quality: VideoQuality): string => {
    switch (quality) {
      case 'auto':
        return 'Auto'
      case '4K':
        return '4K'
      case '2K':
        return '1440p'
      case '1080p':
        return '1080p'
      case '720p':
        return '720p'
      case '540p':
        return '540p'
      case '360p':
        return '360p'
      default:
        return quality
    }
  }

  if (!availableQualities.length) return null

  return (
    <div 
      ref={menuRef}
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      <button
        className="flex items-center space-x-1 px-2 py-1 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select video quality"
        aria-expanded={isOpen}
        aria-controls="quality-menu"
      >
        <span className="text-sm text-white">
          {formatQualityLabel(currentQuality)}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          id="quality-menu"
          className="absolute bottom-full left-0 mb-2 w-32 bg-gray-800 rounded-lg shadow-lg py-1 z-50"
          role="menu"
        >
          {availableQualities.map((quality) => (
            <button
              key={quality}
              className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-700 focus:outline-none focus:bg-gray-700 ${
                quality === currentQuality
                  ? 'text-indigo-400 font-medium'
                  : 'text-white'
              }`}
              onClick={() => {
                onChange(quality)
                setIsOpen(false)
              }}
              role="menuitem"
              aria-current={quality === currentQuality}
            >
              <div className="flex items-center justify-between">
                <span>{formatQualityLabel(quality)}</span>
                {quality === currentQuality && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 