export interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  category: string
  release_year: number
  created_at: string
  updated_at: string
  size: number
  duration?: number
  tags?: string[]
  expiration_date?: string
  is_public?: boolean
  custom_fields?: Record<string, any>
}
