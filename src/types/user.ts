import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  bio?: string
  website?: string
  role: string
  subscription_status: string
  subscription_tier: string
  created_at: string
  updated_at: string
}

export interface User extends Omit<SupabaseUser, 'user_metadata'> {
  user_metadata?: {
    full_name?: string
    subscription_status?: string
    subscription_tier?: string
  }
  email_verified?: boolean
  full_name?: string
  subscription_status?: string
  subscription_tier?: string
  email: string
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: 'read' | 'write' | 'delete' | 'manage' | '*'
  scope: 'global' | 'user' | 'role'
  created_at?: string
  updated_at?: string
}

export interface UserPermission {
  user_id: string
  permission_id: string
  granted_at: string
  granted_by: string
  expires_at?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface UserRole {
  user_id: string
  role_id: string
  assigned_at: string
  assigned_by: string
  expires_at?: string
}

export interface UserActivity {
  id: string
  user_id: string
  content_id: string
  action_type: 'view' | 'download' | 'like' | 'comment'
  created_at: string
  metadata?: Record<string, unknown>
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  download_quality: 'auto' | 'low' | 'medium' | 'high'
  autoplay_videos: boolean
  language: string
  created_at: string
  updated_at: string
}
