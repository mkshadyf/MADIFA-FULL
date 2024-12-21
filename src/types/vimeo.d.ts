export type VideoQuality =
  | 'auto'
  | '4K'
  | '2K'
  | '1080p'
  | '720p'
  | '540p'
  | '360p'

export interface VimeoVideo {
  uri: string
  name: string
  description: string | null
  duration: number
  width?: number
  height?: number
  created_time: string
  modified_time: string
  pictures: {
    active: boolean
    type: string
    base_link: string
    sizes: Array<{
      width: number
      height: number
      link: string
      link_with_play_button?: string
    }>
    resource_key: string
    default_picture: boolean
  } | null
  files?: Array<{
    quality: string
    type: string
    width: number
    height: number
    link: string
  }>
  categories?: Array<{
    name: string
    subcategories: Array<{
      name: string
    }>
  }>
  tags?: Array<{
    name: string
  }>
  metadata?: {
    connections: {
      likes: { total: number }
    }
  }
  status: 'available' | 'uploading' | 'transcoding' | 'error'
  privacy: {
    view: 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted'
    embed: 'public' | 'private'
    download: boolean
    add: boolean
    comments: 'anybody' | 'nobody' | 'all'
  }
  stats: {
    plays: number
    finishes: number
    likes: number
    comments: number
  }
  transcode: {
    status: 'complete' | 'in_progress' | 'error'
  }
}

export interface VimeoError {
  name: string
  message: string
  developer_message?: string
  error_code?: number
}

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

export interface VimeoUploadOptions {
  name: string
  description?: string
  privacy?: {
    view: 'anybody' | 'nobody' | 'password' | 'disable' | 'unlisted'
    embed: 'public' | 'private'
    download: boolean
    add: boolean
    comments: 'anybody' | 'nobody'
  }
  folder_id?: string
  upload_quota?: boolean
  size?: number
}
