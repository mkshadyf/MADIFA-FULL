export * from './supabase';

// User related types
export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'admin' | 'user'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  created_at: string
  updated_at: string
}

// Content related types
export interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  category: 'movies' | 'series' | 'music'
  release_year: number
  created_at: string
  updated_at: string
}

// Auth related types
export interface AuthCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends AuthCredentials {
  fullName: string
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// Navigation types
export interface NavItem {
  name: string
  href: string
  icon?: React.ReactNode
  requiresAuth?: boolean
  requiresAdmin?: boolean
}
