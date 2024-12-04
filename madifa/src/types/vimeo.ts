export type VideoQuality = '4K' | '1080p' | '720p' | '540p' | '360p'

export interface VimeoVideo {
  uri: string
  name: string
  description: string
  duration: number
  width: number
  height: number
  files: Array<{
    quality: VideoQuality
    type: string
    width: number
    height: number
    link: string
  }>
  pictures: {
    base_link: string
    sizes: Array<{
      width: number
      height: number
      link: string
    }>
  }
} 