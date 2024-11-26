export interface Category {
  id: string
  name: string
  slug: string
  description: string
  thumbnail_url?: string
  parent_id?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContentMetadata {
  duration: number
  quality: '480p' | '720p' | '1080p'
  language: string
  subtitles: string[]
  cast: string[]
  director: string
  rating: string
  release_date: string
}

export interface ContentStats {
  views: number
  likes: number
  average_rating: number
  completion_rate: number
  total_watch_time: number
}

export interface ContentFilters {
  category?: string
  year?: number
  quality?: string
  rating?: number
  sortBy?: 'newest' | 'popular' | 'rating'
}

export interface ContentTag {
  id: string
  name: string
  slug: string
  type: 'genre' | 'mood' | 'theme' | 'custom'
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
}

export interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  preview_url?: string
  duration?: number
  release_year: number
  category: string
  is_featured?: boolean
  views: number
  created_at: string
  updated_at: string
} 
