import type { VimeoVideo } from './vimeo'

export interface WatchHistoryItem {
  id: string
  user_id: string
  vimeo_id: string
  progress: number
  completed: boolean
  last_watched: string
  created_at: string
  updated_at: string
  video?: VimeoVideo
} 