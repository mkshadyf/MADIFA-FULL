export interface Video {
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

export interface DatabaseDefinition {
  public: {
    Tables: {
      videos: {
        Row: Video
        Insert: Omit<Video, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Video>
      }
      // Add other table definitions as needed
    }
  }
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          subscription_status: 'active' | 'cancelled' | 'inactive'
          subscription_tier: 'free' | 'premium' | 'premium_plus'
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
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
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          thumbnail_url: string | null
          category: string
          release_year: number
          views: number
          rating: number
          featured: boolean
          created_at: string
          updated_at: string
          creator_id: string
          tags: string[]
          metadata: {
            width?: number
            height?: number
            duration?: number
            fps?: number
            quality?: string
          }
        }
        Insert: Omit<
          Database['public']['Tables']['content']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['content']['Row']>
      }
      videos: {
        Row: {
          id: string
          content_id: string
          url: string
          quality: string
          size: number
          duration: number
          created_at: string
          status: 'processing' | 'ready' | 'error'
          error?: string
          width: number
          height: number
          fps: number
          metadata: Record<string, any>
        }
        Insert: Omit<
          Database['public']['Tables']['videos']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['videos']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'cancelled' | 'past_due'
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          stripe_customer_id: string
          stripe_subscription_id: string
          payment_method_id?: string
          payment_failure_count?: number
        }
        Insert: Omit<
          Database['public']['Tables']['subscriptions']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          language: string
          theme: 'light' | 'dark' | 'system'
          autoplay: boolean
          notifications: boolean
          created_at: string
          download_quality: 'auto' | 'low' | 'medium' | 'high'
          storage_quota: number
          storage_used: number
        }
        Insert: Omit<
          Database['public']['Tables']['user_preferences']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>
      }
      download_queue: {
        Row: {
          id: string
          user_id: string
          content_id: string
          status: 'queued' | 'downloading' | 'completed' | 'error'
          progress: number
          created_at: string
          updated_at: string
          error?: string
          priority: number
        }
        Insert: Omit<
          Database['public']['Tables']['download_queue']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['download_queue']['Row']>
      }
    }
    Views: {
      content_with_stats: {
        Row: Database['public']['Tables']['content']['Row'] & {
          total_views: number
          average_rating: number
          download_count: number
        }
      }
      user_activity: {
        Row: {
          user_id: string
          content_id: string
          action: 'view' | 'download' | 'rate'
          created_at: string
        }
      }
    }
    Functions: {
      get_user_content: {
        Args: { user_id: string }
        Returns: Database['public']['Tables']['content']['Row'][]
      }
      search_content: {
        Args: { query: string }
        Returns: Database['public']['Tables']['content']['Row'][]
      }
      sync_storage_usage: {
        Args: { user_id: string }
        Returns: { quota: number; used: number }
      }
    }
    Enums: {
      subscription_status: 'active' | 'cancelled' | 'inactive' | 'past_due'
      subscription_tier: 'free' | 'premium' | 'premium_plus'
      content_status: 'draft' | 'published' | 'archived'
      download_quality: 'auto' | 'low' | 'medium' | 'high'
    }
  }
}

// Export type aliases for convenience
export type Tables = Database['public']['Tables']
export type Views = Database['public']['Views']
export type Functions = Database['public']['Functions']
export type Enums = Database['public']['Enums']

// Re-export DatabaseDefinition Tables for backward compatibility
export type { DatabaseDefinition as DatabaseSchema }
export type DatabaseTables = DatabaseDefinition['public']['Tables']
