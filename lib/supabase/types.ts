import type { Database } from './database.types'

export type Profile = {
  id: string
  user_id: string
  full_name: string
  avatar_url?: string
  pin_code?: string
  created_at: string
  updated_at: string
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  category: string
  release_year: number
  duration: number
  status: 'processing' | 'ready' | 'failed'
  error_message?: string
  created_at: string
  updated_at: string
  content_count?: number
  total_views?: number
  average_rating?: number
  available_qualities?: string[]
}

export interface Category extends Content {
  content_count: number
  total_views: number
}

export type UploadProgress = {
  loaded: number
  total: number
}

export type FileOptions = {
  cacheControl?: string
  contentType?: string
  upsert?: boolean
  onProgress?: (progress: UploadProgress) => void
} 