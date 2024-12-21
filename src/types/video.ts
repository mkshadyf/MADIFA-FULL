export type VideoQuality =
  | 'auto'
  | '4K'
  | '2K'
  | '1080p'
  | '720p'
  | '540p'
  | '480p'
  | '360p'
  | '240p'

export const DEFAULT_QUALITIES: VideoQuality[] = [
  'auto',
  '240p',
  '360p',
  '480p',
  '540p',
  '720p',
  '1080p',
  '2K',
  '4K',
]

export interface VideoPlayerConfig {
  maxBufferLength?: number
  maxMaxBufferLength?: number
  enableWorker?: boolean
  lowLatencyMode?: boolean
}

export interface VideoPlayerInstance {
  hls: any | null
  video: HTMLVideoElement | null
  config: VideoPlayerConfig
  events: {
    onError: (error: Error) => void
    onProgress: (progress: number) => void
    onQualityChange: (quality: VideoQuality) => void
  }
}

export interface VideoPlayerProps {
  url: string
  thumbnail: string
  title: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  quality?: VideoQuality
  startTime?: number
  onError?: (error: Error) => void
  onReady?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onProgress?: (progress: number) => void
  onQualityChange?: (quality: VideoQuality) => void
}

export interface VideoControlsProps {
  isPlaying: boolean
  currentQuality: VideoQuality
  onPlayPause: () => void
  onQualityChange: (quality: VideoQuality) => void
}

export interface VideoProgressProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export interface BufferingIndicatorProps {
  isBuffering: boolean
}
