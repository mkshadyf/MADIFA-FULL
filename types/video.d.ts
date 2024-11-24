import type Hls from 'hls.js'

export interface VideoPlayerConfig {
  maxBufferLength: number
  maxMaxBufferLength: number
  enableWorker: boolean
  lowLatencyMode: boolean
}

export interface VideoPlayerEvents {
  onError: (error: Error) => void
  onProgress: (progress: number) => void
  onQualityChange: (quality: string) => void
}

export interface VideoPlayerInstance {
  hls: Hls | null
  video: HTMLVideoElement | null
  config: VideoPlayerConfig
  events: VideoPlayerEvents
}

export type VideoQuality = '480p' | '720p' | '1080p' 