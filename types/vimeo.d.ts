export type VideoQuality = '2160p' | '1440p' | '1080p' | '720p' | '540p' | '360p'

export interface VimeoVideo {
  uri: string
  name: string
  description: string
  duration: number
  pictures: {
    sizes: {
      width: number
      height: number
      link: string
    }[]
  }
  files: {
    quality: VideoQuality
    type: string
    width: number
    height: number
    link: string
  }[]
  privacy: {
    view: 'anybody' | 'disable' | 'unlisted'
  }
  status: string
}

export interface VimeoError {
  error: string
  developer_message: string
  user_message: string
} 