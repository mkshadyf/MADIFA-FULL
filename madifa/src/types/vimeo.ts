export type VideoQuality = '1080p' | '720p' | '480p' | '360p'

export interface VimeoError {
  message: string
  name: string
  status?: number
}

export interface VimeoRequestOptions {
  method: string
  path: string
  query?: Record<string, any>
  headers?: Record<string, string>
  body?: any
}

export interface ContentSecurity {
  privacy: {
    view: 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted'
    embed: 'public' | 'private'
    comments: 'anybody' | 'nobody'
    download: boolean
    add: boolean
  }
  embed_settings: {
    buttons: {
      like: boolean
      share: boolean
      embed: boolean
      watchlater: boolean
      hd: boolean
    }
    logos: {
      vimeo: boolean
      custom: {
        active: boolean
        url?: string
        link?: string
      }
    }
    title: {
      name: boolean
      owner: boolean
      portrait: boolean
    }
  }
  domain_restrictions: {
    allowed_domains: string[]
    whitelist_enabled: boolean
  }
  type: 'jwt' | 'hmac'
  key: string
  secret: string
  expiry?: number
}

export interface VimeoVideo {
  uri: string
  name: string
  description: string
  duration: number
  width: number
  height: number
  privacy: ContentSecurity['privacy']
  pictures: {
    uri: string
    active: boolean
    type: string
    sizes: Array<{
      width: number
      height: number
      link: string
    }>
  }
  files: Array<{
    quality: VideoQuality
    type: string
    width: number
    height: number
    link: string
    size: number
    fps: number
    mime_type: 'application/x-mpegURL' | 'application/dash+xml' | 'video/mp4'
  }>
  status: string
  transcode: {
    status: string
    progress: number
  }
  upload: {
    status: string
    upload_link: string
    form: string
    approach: string
    size: number
    redirect_url: string
  }
  metadata: {
    connections: {
      views: {
        total: number
      }
      likes: {
        total: number
      }
      comments: {
        total: number
      }
    }
  }
  categories?: Array<{
    uri: string
    name: string
    link: string
  }>
  stats: {
    plays: number
  }
  security?: ContentSecurity
  created_time: string
  modified_time: string
  release_time: string
}

export interface VimeoPlayer {
  element: HTMLElement
  origin: string
  ready(): Promise<void>
  destroy(): void
  requestFullscreen(): Promise<void>
  exitFullscreen(): Promise<void>
  getVideoTitle(): Promise<string>
  getVideoId(): Promise<string>
  getVideoWidth(): Promise<number>
  getVideoHeight(): Promise<number>
  getDuration(): Promise<number>
  getCurrentTime(): Promise<number>
  setCurrentTime(seconds: number): Promise<void>
  getPaused(): Promise<boolean>
  play(): Promise<void>
  pause(): Promise<void>
  getEnded(): Promise<boolean>
  getLoop(): Promise<boolean>
  setLoop(loop: boolean): Promise<void>
  getMuted(): Promise<boolean>
  setMuted(muted: boolean): Promise<void>
  getVolume(): Promise<number>
  setVolume(volume: number): Promise<void>
  getPlaybackRate(): Promise<number>
  setPlaybackRate(rate: number): Promise<void>
  getQuality(): Promise<VideoQuality>
  setQuality(quality: VideoQuality): Promise<void>
  on(event: string, callback: (data?: any) => void): void
  off(event: string, callback?: (data?: any) => void): void
  loadVideo(id: number | string): Promise<void>
  unload(): Promise<void>
}

export interface VimeoUploadOptions {
  name?: string
  description?: string
  license?: string
  review_page?: {
    active: boolean
  }
  embed?: {
    buttons?: {
      like?: boolean
      watchlater?: boolean
      share?: boolean
      embed?: boolean
      hd?: boolean
      fullscreen?: boolean
      scaling?: boolean
    }
    logos?: {
      vimeo?: boolean
      custom?: {
        active?: boolean
        url?: string
        link?: string
      }
    }
    title?: {
      name?: string
      owner?: string
      portrait?: string
    }
  }
  privacy?: {
    view: 'anybody' | 'disable' | 'unlisted'
    embed?: 'public' | 'private'
    comments?: 'anybody' | 'nobody'
    download?: boolean
    add?: boolean
  }
  pictures?: {
    active: boolean
    uri?: string
  }
  folderUri?: string
  onProgress?: (progress: {
    loaded: number
    total: number
    percent: number
  }) => void
}