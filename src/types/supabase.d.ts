import type { Content, ContentMetadata } from './content'
import type { User, UserProfile } from './user'

interface AdminStats {
  id: string
  total_users: number
  active_users: number
  total_content: number
  total_storage: number
  total_bandwidth: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      content: {
        Row: Content
        Insert: Omit<Content, 'id' | 'created_at'>
        Update: Partial<Omit<Content, 'id' | 'created_at'>>
      }
      content_metadata: {
        Row: ContentMetadata
        Insert: Omit<ContentMetadata, 'id' | 'created_at'>
        Update: Partial<Omit<ContentMetadata, 'id' | 'created_at'>>
      }
      admin_stats: {
        Row: AdminStats
        Insert: AdminStats
        Update: Partial<AdminStats>
      }
      user_profile: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          video_id: string
          created_at: string
        }
        Insert: Omit<{ id: string; user_id: string; video_id: string; created_at: string }, 'id' | 'created_at'>
        Update: Partial<Omit<{ id: string; user_id: string; video_id: string; created_at: string }, 'id' | 'created_at'>>
      }
    }
    Views: {
      [key: string]: {
        Row: Record<string, unknown>
      }
    }
    Functions: {
      [key: string]: unknown
    }
  }
}
