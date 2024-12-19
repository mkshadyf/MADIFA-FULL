export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          duration: number
          created_at: string
          updated_at: string
          status: 'processing' | 'ready' | 'error'
          error?: string
        }
        Insert: Omit<
          Database['public']['Tables']['videos']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['videos']['Row']>
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          role: 'user' | 'admin'
          subscription_status: 'active' | 'inactive' | 'cancelled'
          subscription_tier: 'free' | 'basic' | 'premium'
        }
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          preferences: {
            theme: 'light' | 'dark'
            notifications: boolean
          }
          subscription_status: 'active' | 'inactive' | 'cancelled'
          subscription_tier: 'free' | 'basic' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['profiles']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['categories']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      video_categories: {
        Row: {
          video_id: string
          category_id: string
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['video_categories']['Row'],
          'created_at'
        >
        Update: Partial<Database['public']['Tables']['video_categories']['Row']>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          video_id: string
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['favorites']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['favorites']['Row']>
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          video_id: string
          watched_at: string
          progress: number
        }
        Insert: Omit<Database['public']['Tables']['watch_history']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['watch_history']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'inactive' | 'cancelled'
          tier: 'free' | 'basic' | 'premium'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['subscriptions']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
