import type { User } from '@/types'
import type { Content } from '@/types/content'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>>
      }
      user_profiles: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
      }
      content: {
        Row: Content
        Insert: Omit<Content, 'id' | 'created_at'>
        Update: Partial<Content>
      }
      content_metadata: {
        Row: {
          content_id: string
          language: string
          quality: string
          width: number
          height: number
          fps: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_metadata']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['content_metadata']['Row']>
      }
      content_categories: {
        Row: {
          content_id: string
          category_id: string
        }
        Insert: Database['public']['Tables']['content_categories']['Row']
        Update: Partial<Database['public']['Tables']['content_categories']['Row']>
      }
      content_tags: {
        Row: {
          content_id: string
          tag: string
        }
        Insert: Database['public']['Tables']['content_tags']['Row']
        Update: Partial<Database['public']['Tables']['content_tags']['Row']>
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          video_url: string | null
          duration: number
          category: string
          tags: string[]
          release_year: number
          status: 'error' | 'processing' | 'ready'
          created_at: string
          updated_at: string
          size: number | null
        }
        Insert: Omit<Database['public']['Tables']['videos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['videos']['Row']>
      }
      admin_stats: {
        Row: {
          id: string
          total_users: number
          total_content: number
          total_views: number
          storage_used: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_stats']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_stats']['Row']>
      }
    }
  }
}

export type { Content }

