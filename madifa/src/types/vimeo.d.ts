import '@vimeo/player'

declare module '@vimeo/player' {
  export interface VimeoPlayerOptions {
    id: string | number
    url?: string
    width?: number | string
    height?: number | string
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
    quality?: string
    responsive?: boolean
    speed?: boolean
    title?: boolean
    transparent?: boolean
  }

  export interface VimeoPlayer {
    setVolume(volume: number): Promise<void>
    setMuted(muted: boolean): Promise<void>
    setPlaybackRate(rate: number): Promise<void>
    setQuality(quality: string): Promise<void>
    getCurrentTime(): Promise<number>
    setCurrentTime(time: number): Promise<number>
    getDuration(): Promise<number>
    getPaused(): Promise<boolean>
    play(): Promise<void>
    pause(): Promise<void>
    getMuted(): Promise<boolean>
    getVolume(): Promise<number>
    on(event: string, callback: (data: any) => void): void
    off(event: string, callback: (data: any) => void): void
    destroy(): Promise<void>
    getQualities(): Promise<VideoQuality[]>
  }

  export default class Player implements VimeoPlayer {
    constructor(element: HTMLElement | string, options: VimeoPlayerOptions)
    setVolume(volume: number): Promise<void>
    setMuted(muted: boolean): Promise<void>
    setPlaybackRate(rate: number): Promise<void>
    setQuality(quality: string): Promise<void>
    getCurrentTime(): Promise<number>
    setCurrentTime(time: number): Promise<number>
    getDuration(): Promise<number>
    getPaused(): Promise<boolean>
    play(): Promise<void>
    pause(): Promise<void>
    getMuted(): Promise<boolean>
    getVolume(): Promise<number>
    on(event: string, callback: (data: any) => void): void
    off(event: string, callback: (data: any) => void): void
    destroy(): Promise<void>
    getQualities(): Promise<VideoQuality[]>
  }
}

export type { VimeoPlayer }

export interface VimeoFolder {
  uri: string
  name: string
  created_time: string
  modified_time: string
  user: {
    uri: string
    name: string
  }
  metadata: {
    connections: {
      videos: {
        total: number
      }
    }
  }
}

export interface VimeoVideo {
  uri: string
  name: string
  description: string
  duration: number
  width: number
  height: number
  created_time: string
  modified_time: string
  pictures: {
    base_link: string
    sizes: Array<{
      width: number
      height: number
      link: string
    }>
  }
  files: Array<{
    quality: string
    type: string
    width: number
    height: number
    link: string
  }>
  categories: Array<{
    name: string
    subcategories: Array<{
      name: string
    }>
  }>
  tags: Array<{
    name: string
  }>
  metadata: {
    connections: {
      likes: { total: number }
    }
  }
  status: string
}

export type VideoQuality = 'auto' | '4K' | '2K' | '1080p' | '720p' | '540p' | '360p'

export interface VimeoError {
  name: string
  message: string
  developer_message?: string
  error_code?: number
} 
