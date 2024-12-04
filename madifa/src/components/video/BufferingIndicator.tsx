import React from 'react'

interface BufferingIndicatorProps {
  isBuffering: boolean
}

export default function BufferingIndicator({ isBuffering }: BufferingIndicatorProps) {
  if (!isBuffering) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 animate-spin">
          <div className="h-full w-full rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent" />
        </div>
        <div className="absolute inset-0 animate-ping">
          <div className="h-full w-full rounded-full border-4 border-indigo-500 opacity-20" />
        </div>
      </div>
    </div>
  )
} 