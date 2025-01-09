export type ContentStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'processing'
  | 'ready'
  | 'inactive'
export type ContentType = 'video' | 'audio' | 'document' | 'image'
export type EncodingStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type ContentVisibility = 'public' | 'private' | 'unlisted'

export interface Content {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  preview_url?: string
  video_url?: string
  duration?: number
  category_id: string
  created_at: string
  updated_at: string
  views: number
  rating: number | null
  size: number
  category: string
  tags: string[]
  fileSize: number
  owner_id: string
  content_type: ContentType
  expiration_date?: string
  vimeo_id?: string
  metadata?: ContentMetadata
  status: ContentStatus
  type: ContentType
  visibility: ContentVisibility
  encoding_status?: EncodingStatus
  release_year?: number
  availability_window?: number
  is_public?: boolean
  custom_fields?: Record<string, string>
  monetization?: {
    type: 'free' | 'premium' | 'pay_per_view'
    price?: number
    currency?: string
  }
  onProgress?: (progress: number) => void
  retries?: number
  permissions?: string[]
}

export interface ContentMetadata {
  width?: number
  height?: number
  duration?: number
  fps?: number
  quality?: string
  category?: string
  tags?: string[]
  release_date?: string
  language?: string
  score?: number
  reason?: string
  views?: number
  likes?: number
  categories?: string[]
  files?: {
    quality: string
    type: string
    width: number
    height: number
    link: string
    size: number
  }[]
  pictures?: {
    width: number
    height: number
    link: string
  }[]
}

export interface ContentWithStats extends Content {
  total_views: number
  average_rating: number
  download_count: number
}

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
  metadata?: {
    icon?: string
    color?: string
    featured?: boolean
    seo_title?: string
    seo_description?: string
  }
}

export interface ContentFilter {
  category?: string
  status?: ContentStatus
  search?: string
  sortBy?: keyof Content
  sortOrder?: 'asc' | 'desc'
}

export interface FavoriteContent extends Content {
  favorited_at: string
  user_id: string
  favorite_id: string
}
