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
  visible,
}: ThumbnailPreviewProps) {
  if (!visible) return null

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-full transform overflow-hidden rounded-lg bg-black shadow-lg"
      style={{
        left: position.x,
        top: position.y - 8,
      }}
    >
      <div className="relative h-24 w-40">
        <img
          src={thumbnailUrl}
          alt="Preview"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-xs">
          {formatDuration(time)}
        </div>
      </div>
    </div>
  )
}
