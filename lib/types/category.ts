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

export interface CategoryWithContent extends Category {
  content_count: number
  total_views: number
  average_rating: number
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
} 