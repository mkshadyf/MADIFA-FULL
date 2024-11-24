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

export type Content = Database['public']['Tables']['content']['Row']

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