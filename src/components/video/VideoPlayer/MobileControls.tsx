import React from 'react'

interface MobileControlsProps {
  isPlaying: boolean
  progress: number
  isMuted: boolean
  onPlayToggle: () => void
  onMuteToggle: () => void
  onSeek: (progress: number) => void
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  isPlaying,
  progress,
  isMuted,
  onPlayToggle,
  onMuteToggle,
  onSeek,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Center play/pause button */}
      <button onClick={onPlayToggle} className="rounded-full bg-black/50 p-4">
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={progress}
          onChange={e => onSeek(parseFloat(e.target.value))}
          className="w-full"
          title="Video progress"
          aria-label="Video progress"
        />

        <div className="mt-2 flex justify-between">
          <button onClick={onMuteToggle}>{isMuted ? 'Unmute' : 'Mute'}</button>
        </div>
      </div>
    </div>
  )
}
