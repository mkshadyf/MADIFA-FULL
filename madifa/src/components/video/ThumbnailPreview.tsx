import React from 'react'
import { formatDuration } from '@/lib/utils/format'

interface ThumbnailPreviewProps {
  thumbnailUrl: string
  time: number
  position: { x: number; y: number }
  visible: boolean
}

export default function ThumbnailPreview({ 
  thumbnailUrl, 
  time, 
  position, 
  visible 
}: ThumbnailPreviewProps) {
  if (!visible) return null

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-full bg-black rounded-lg overflow-hidden shadow-lg"
      style={{ 
        left: position.x,
        top: position.y - 8
      }}
    >
      <div className="w-40 h-24 relative">
        <img 
          src={thumbnailUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-xs text-center">
          {formatDuration(time)}
        </div>
      </div>
    </div>
  )
} 