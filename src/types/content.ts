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
  title?: string
  description?: string
  category?: string
  tags?: string[]
  release_year?: number
  duration?: number
  thumbnail_url?: string
  video_url?: string
  size?: number
  status?: ContentStatus
  created_at?: string
  updated_at?: string
}

export type ContentStatus = 'error' | 'processing' | 'ready'

export interface ContentStats {
  total_views: number
  total_downloads: number
  average_rating: number
  total_ratings: number
  total_comments: number
  created_at: string
  updated_at: string
}

export interface ContentFilters {
  category?: string
  tags?: string[]
  status?: ContentStatus
  release_year?: number
  search?: string
  sort_by?: 'title' | 'created_at' | 'updated_at' | 'release_year'
  sort_order?: 'asc' | 'desc'
}

export interface ContentTag {
  id: string
  name: string
  content_count: number
  created_at: string
  updated_at: string
}

export interface ContentSeries {
  id: string
  title: string
  description: string
  thumbnail_url: string
  content_ids: string[]
  created_at: string
  updated_at: string
}

export interface UserContentInteraction {
  user_id: string
  content_id: string
  type: 'view' | 'download' | 'rate' | 'comment'
  rating?: number
  comment?: string
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  duration: number
  category: string
  tags: string[]
  release_year: number
  status: ContentStatus
  created_at: string
  updated_at: string
  size: number | null
  metadata?: ContentMetadata
  fileSize?: number
  preview_url?: string
  expiration_date?: string
  availability_window?: string
  is_public?: boolean
  custom_fields?: Record<string, any>
  error_message?: string
}
