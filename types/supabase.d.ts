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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          vimeo_id: string
          thumbnail_url: string
          duration: number
          category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          vimeo_id: string
          thumbnail_url: string
          duration: number
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          vimeo_id?: string
          thumbnail_url?: string
          duration?: number
          category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_lists: {
        Row: {
          id: string
          user_id: string
          content_id: string
          list_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          list_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          list_type?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_categories: string[]
          preferred_languages: string[]
          email_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_categories?: string[]
          preferred_languages?: string[]
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_categories?: string[]
          preferred_languages?: string[]
          email_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          content_id: string
          progress: number
          last_watched: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          progress: number
          last_watched?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          progress?: number
          last_watched?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T] 