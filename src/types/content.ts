export interface Category {
  id: string
  name: string
  slug: string
  description: string
  thumbnail_url?: string
  parent_id?: string | null
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
  content_count?: number
  total_views?: number
  average_rating?: number
  views?: number
  metadata?: CategoryMetadata
  release_year?: number
  category?: string
}

export interface CategoryMetadata {
  icon?: string
  color?: string
  featured?: boolean
  seo_title?: string
  seo_description?: string
}

export interface CategoryStats {
  name: string
  count: number
  totalViews: number
  averageRating: number
  totalSize: number
  averageDuration: number
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
  level: number
}

export interface ContentMetadata {
  duration: number
  quality: '480p' | '720p' | '1080p' | '2160p'
  language: string
  subtitles: string[]
  cast: string[]
  director: string
  rating: string
  release_date: string
  size?: number
  format?: string
  bitrate?: number
  fps?: number
  audio_tracks?: string[]
}

export interface ContentStats {
  views: number
  likes: number
  average_rating: number
  completion_rate: number
  total_watch_time: number
  unique_viewers?: number
  shares?: number
  comments?: number
}

export interface ContentFilters {
  category?: string
  year?: number
  quality?: string
  rating?: number
  language?: string
  sortBy?: 'newest' | 'popular' | 'rating' | 'oldest'
  tags?: string[]
  duration?: {
    min?: number
    max?: number
  }
}

export interface ContentTag {
  id: string
  name: string
  slug: string
  type: 'genre' | 'mood' | 'theme' | 'custom'
  count?: number
}

export interface ContentSeries {
  id: string
  title: string
  description: string
  season_number: number
  episode_number: number
  series_id: string
  series_title: string
  thumbnail_url: string
  release_date: string
  next_episode?: string
  previous_episode?: string
  total_episodes?: number
  total_seasons?: number
}

export interface UserContentInteraction {
  content_id: string
  user_id: string
  favorite: boolean
  watchlist: boolean
  rating: number
  progress: number
  last_watched: string
  created_at: string
  updated_at: string
  watch_count?: number
  total_watch_time?: number
  notes?: string
}

export interface Content {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  category: string
  tags?: string[]
  release_year?: number
  status: 'error' | 'processing' | 'ready'
  created_at: string
  updated_at: string
  duration: number
  size?: number
  error?: string
  metadata?: ContentMetadata
}
