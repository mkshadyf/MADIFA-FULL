export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          email: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          title: string
          description: string
          thumbnail_url: string
          video_url: string
          preview_url?: string
          duration?: number
          release_year: number
          category: string
          is_featured?: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          thumbnail_url: string
          video_url: string
          preview_url?: string
          duration?: number
          release_year: number
          category: string
          is_featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          thumbnail_url?: string
          video_url?: string
          preview_url?: string
          duration?: number
          release_year?: number
          category?: string
          is_featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          thumbnail_url?: string
          parent_id?: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          thumbnail_url?: string
          parent_id?: string
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          genres: string[]
          languages: string[]
          notifications_enabled: boolean
          preferred_quality: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          genres?: string[]
          languages?: string[]
          notifications_enabled?: boolean
          preferred_quality?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          genres?: string[]
          languages?: string[]
          notifications_enabled?: boolean
          preferred_quality?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      populate_database: {
        Args: Record<string, never>
        Returns: { success: boolean }
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
    }
  }
} 