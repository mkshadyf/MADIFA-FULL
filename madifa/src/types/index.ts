import type { Database } from '@/lib/supabase/database.types';

export * from './supabase';

// User related types
export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'admin' | 'user'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  subscription_status: 'active' | 'inactive' | 'cancelled'
  avatar_url?: string
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
  category: string
  duration?: number
  release_year: number
  created_at: string
  updated_at: string
  metadata?: {
    width?: number
    height?: number
    fps?: number
    quality?: string
    status?: string
  }
}

// Subscription types
export interface SubscriptionPlan {
  id: 'free' | 'premium' | 'premium_plus'
  name: string
  price: number
  features: string[]
}

// Database types
export type DbTables = Database['public']['Tables']
export type DbContent = DbTables['content']['Row']
export type DbProfile = DbTables['user_profiles']['Row']

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
