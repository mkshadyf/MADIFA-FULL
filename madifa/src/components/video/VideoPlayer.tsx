import React, { useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'

interface PlayerOptions {
  id?: number
  url?: string
  width?: number
  height?: number
  autopause?: boolean
  autoplay?: boolean
  background?: boolean
  byline?: boolean
  color?: string
  controls?: boolean
  dnt?: boolean
  keyboard?: boolean
  loop?: boolean
  muted?: boolean
  pip?: boolean
  playsinline?: boolean
  portrait?: boolean
  responsive?: boolean
  speed?: boolean
  texttrack?: string
  title?: boolean
  transparent?: boolean
}

interface VideoPlayerProps {
  videoId: string
  options?: Partial<PlayerOptions>
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onError?: (error: Error) => void
  className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  options = {},
  onReady,
  onPlay,
  onPause,
  onEnd,
  onTimeUpdate,
  onError,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [duration, setDuration] = useState<number>(0)

  useEffect(() => {
    if (!containerRef.current) return

    const playerOptions: PlayerOptions = {
      url: `https://player.vimeo.com/video/${videoId}`,
      responsive: true,
      ...options
    }

    const vimeoPlayer = new Player(containerRef.current, playerOptions)

    vimeoPlayer.on('loaded', () => {
      setPlayer(vimeoPlayer)
      onReady?.()
      vimeoPlayer.getDuration().then((duration: number) => {
        setDuration(duration)
      }).catch((error: Error) => {
        onError?.(error)
      })
    })

    vimeoPlayer.on('play', () => onPlay?.())
    vimeoPlayer.on('pause', () => onPause?.())
    vimeoPlayer.on('ended', () => onEnd?.())
    vimeoPlayer.on('timeupdate', ({ seconds }: { seconds: number }) => onTimeUpdate?.(seconds))
    vimeoPlayer.on('error', (error: Error) => onError?.(error))

    return () => {
      vimeoPlayer.destroy()
    }
  }, [videoId, options, onReady, onPlay, onPause, onEnd, onTimeUpdate, onError])

  const handlePlayPause = async () => {
    if (!player) return

    const state = await player.getPaused()
    if (state) {
      await player.play()
    } else {
      await player.pause()
    }
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
      {duration > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={handlePlayPause}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Play/Pause
          </button>
          <span>Duration: {Math.floor(duration)}s</span>
        </div>
      )}
    </div>
  )
} 