export type VideoQuality = '4K' | '2K' | '1080p' | '720p' | '540p' | '360p'

export interface VimeoVideo {
  uri: string
  name: string
  description: string
  duration: number
  width: number
  height: number
  privacy: {
    view: 'anybody' | 'disable' | 'unlisted'
    embed: 'private' | 'public'
  }
  pictures: {
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
  }>
  status: string
}

export interface VimeoError {
  error: string
  developer_message: string
  user_message: string
} 
