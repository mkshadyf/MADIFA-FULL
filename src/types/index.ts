export * from './analytics'
export * from './auth'
export * from './vimeo'

export interface Content {
  id: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  release_year?: number
  expiration_date?: string
  availability_window?: {
    start: string
    end: string
  }
  is_public: boolean
  custom_fields?: Record<string, any>
  size?: number
  fileSize?: number
  duration?: number // Added duration field
  thumbnail_url?: string | null // Added thumbnail_url field
  status?: 'ready' | 'processing' // Added status field
  created_at?: string // Added created_at field
  updated_at?: string // Added updated_at field
  error?: string // Added error field
}

export interface ContentMetadata {
  title: string
  description?: string
  category?: string
  tags?: string[]
  custom_fields?: Record<string, any>
}

export interface Playlist {
  id: string
  name: string
  description?: string
  contents: Content[]
}

export interface Series {
  id: string
  title: string
  description?: string
  episodes: Content[]
  season_number?: number
}

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  subscription_status: 'active' | 'inactive' | 'cancelled'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  created_at: string
}

// Core type definitions
export interface BaseError extends Error {
  status: number;
  code: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error: null | BaseError;
}

// Re-export types explicitly to avoid ambiguity
export type { VideoQuality as AppVideoQuality } from './auth'
export * from './content'
export * from './subscription'
export * from './user'
export type { VideoQuality as VimeoVideoQuality } from './vimeo'

