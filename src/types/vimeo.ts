import type Player from '@vimeo/player'

export type VimeoPlayer = Player

export interface VimeoVideo {
  uri: string
  name: string
  description: string | null
  type: string
  link: string
  duration: number
  width: number
  height: number
  created_time: string
  modified_time: string
  release_time: string
  content_rating: string[]
  license: string | null
  privacy: {
    view: 'anybody' | 'nobody' | 'password' | 'disable'
    embed: 'public' | 'private' | 'whitelist'
    download: boolean
    add: boolean
    comments: 'anybody' | 'nobody'
  }
  pictures: {
    uri: string
    active: boolean
    type: string
    base_link: string
    sizes: Array<{
      width: number
      height: number
      link: string
      link_with_play_button: string
    }>
  }
  stats: {
    plays: number | null
    likes: number
    comments: number
  }
  categories: Array<{
    uri: string
    name: string
    link: string
    top_level: boolean
    is_deprecated: boolean
  }>
  metadata: {
    connections: {
      comments: {
        uri: string
        options: string[]
        total: number
      }
      likes: {
        uri: string
        options: string[]
        total: number
      }
      pictures: {
        uri: string
        options: string[]
        total: number
      }
      texttracks: {
        uri: string
        options: string[]
        total: number
      }
      related: {
        uri: string
        options: string[]
      }
      recommendations: {
        uri: string
        options: string[]
      }
    }
    interactions: {
      watchlater: {
        uri: string
        options: string[]
        added: boolean
        added_time: string | null
      }
      like: {
        uri: string
        options: string[]
        added: boolean
        added_time: string | null
      }
      report: {
        uri: string
        options: string[]
        reason: string[]
      }
    }
    is_vimeo_create: boolean
    is_screen_record: boolean
  }
  tags: Array<{
    uri: string
    name: string
    tag: string
    canonical: string
    metadata: {
      connections: {
        videos: {
          uri: string
          options: string[]
          total: number
        }
      }
    }
  }>
  transcode: {
    status: 'complete' | 'in_progress' | 'error'
  }
}

export interface VimeoChapter {
  uri: string
  active: boolean
  type: string
  timecode: number
  title: string
}

export interface VimeoStats {
  plays: number
  finishes: number
  loads: number
  likes: number
  comments: number
  downloads: number
}

export interface VimeoProgress {
  seconds: number
  percent: number
}

export interface VimeoThumbnail {
  uri: string
  active: boolean
  type: string
  base_link: string
  sizes: Array<{
    width: number
    height: number
    link: string
    link_with_play_button: string
  }>
}

export interface VimeoError {
  message: string
  name: string
  status: number
  error: string
  developer_message: string
  error_code: string
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
        uri: string
        total: number
      }
    }
  }
  total: number
  page: number
  per_page: number
  has_more: boolean
}

export interface VimeoUploadOptions {
  name: string
  description?: string
  privacy?: {
    view: 'anybody' | 'nobody' | 'contacts' | 'disable' | 'unlisted'
    embed: 'public' | 'private'
    comments: 'anybody' | 'nobody'
    download: boolean
  }
  folder_id?: string
}

export type VideoQuality = 'auto' | '4K' | '2K' | '1080p' | '720p' | '540p' | '360p'

export interface VimeoQualityChangeEvent {
  quality: VideoQuality
  previousQuality: VideoQuality | null
}
