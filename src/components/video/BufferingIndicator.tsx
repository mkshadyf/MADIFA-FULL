import React from 'react'

interface BufferingIndicatorProps {
  isBuffering: boolean
}

export default function BufferingIndicator({
  isBuffering,
}: BufferingIndicatorProps) {
  if (!isBuffering) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin">
          <div className="h-full w-full rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-indigo-500" />
        </div>
        <div className="absolute inset-0 animate-ping">
          <div className="h-full w-full rounded-full border-4 border-indigo-500 opacity-20" />
        </div>
      </div>
    </div>
  )
}
