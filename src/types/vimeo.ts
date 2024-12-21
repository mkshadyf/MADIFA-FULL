import type Player from '@vimeo/player';
import { BaseError } from './index';

export type VimeoPlayer = Player

export interface VimeoVideo {
  uri: string
  name: string
  description: string | null
  duration: number
  width: number
  height: number
  player_embed_url: string
  status: 'available' | 'uploading' | 'transcoding' | 'error'
  privacy: {
    view: 'anybody' | 'nobody' | 'password' | 'disable'
    embed: 'public' | 'private' | 'whitelist'
    download: boolean
    add: boolean
    comments: 'anybody' | 'nobody'
  }
  files: Array<{
    quality: string
    rendition: string
    type: string
    width: number
    height: number
    link: string
    size: number
    fps: number
  }>
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
  stats: {
    plays: number
    likes: number
    comments: number
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

export interface VimeoError extends BaseError {
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

export type VideoQuality =
  | 'auto'
  | '4K'
  | '2K'
  | '1080p'
  | '720p'
  | '540p'
  | '360p'
  | '240p'

export interface VimeoQualityChangeEvent {
  quality: VideoQuality
  previousQuality: VideoQuality | null
}
