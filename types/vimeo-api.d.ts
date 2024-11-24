declare module '@vimeo/vimeo' {
  export interface VimeoRequestOptions {
    method: string
    path: string
    query?: Record<string, any>
    headers?: Record<string, string>
  }

  export interface VimeoUploadOptions {
    name: string
    description?: string
    privacy?: {
      view: 'anybody' | 'disable' | 'unlisted'
      embed?: 'private' | 'public'
      comments?: 'anybody' | 'nobody'
      download?: boolean
    }
  }

  export class Vimeo {
    constructor(clientId: string, clientSecret: string, accessToken: string)

    request(
      options: VimeoRequestOptions,
      callback: (error: Error | null, result: any, statusCode?: number) => void
    ): void

    upload(
      file: string | File | Buffer,
      options: VimeoUploadOptions,
      completeCallback: (uri: string) => void,
      errorCallback: (error: Error) => void,
      progressCallback: (bytesUploaded: number, bytesTotal: number) => void
    ): void
  }
}

declare module '@vimeo/player' {
  export interface PlayerOptions {
    id?: number | string
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
    loop?: boolean
    muted?: boolean
    pip?: boolean
    playsinline?: boolean
    portrait?: boolean
    responsive?: boolean
    speed?: boolean
    title?: boolean
    transparent?: boolean
  }

  export default class Player {
    constructor(element: HTMLElement | string, options: PlayerOptions)
    destroy(): void
    getVideoTitle(): Promise<string>
    getVideoId(): Promise<number>
    getDuration(): Promise<number>
    getCurrentTime(): Promise<number>
    setCurrentTime(seconds: number): Promise<number>
    on(event: string, callback: Function): void
    off(event: string, callback?: Function): void
  }
} 