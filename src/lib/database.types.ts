import type {
  SubscriptionStatus,
  SubscriptionTier,
  User,
  UserRole,
} from '@/types/auth'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<
          User,
          'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'
        >
        Update: Partial<
          Omit<
            User,
            'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'
          >
        >
      }
      admin_stats: {
        Row: {
          total_users: number
          active_users: number
          total_content: number
          total_storage: number
          total_revenue: number
          active_subscriptions: number
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['admin_stats']['Row'],
          'updated_at'
        >
        Update: Partial<Database['public']['Tables']['admin_stats']['Row']>
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
          role: UserRole
          subscription_status: SubscriptionStatus
          subscription_tier: SubscriptionTier
          created_at: string
          updated_at: string
          last_active_at?: string
          email_verified?: boolean
          phone_verified?: boolean
          two_factor_enabled?: boolean
          login_count?: number
          failed_login_count?: number
          last_login_at?: string
          metadata?: Record<string, unknown>
          preferences?: {
            theme: 'light' | 'dark' | 'system'
            emailNotifications: boolean
            language: string
            timezone?: string
            dateFormat?: string
            timeFormat?: string
            notifications?: {
              email?: boolean
              push?: boolean
              sms?: boolean
            }
          }
        }
        Insert: Omit<
          Database['public']['Tables']['user_profiles']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
      }
      content: {
        Row: {
          id: string
          title: string
          description?: string
          thumbnail_url?: string
          preview_url?: string
          duration?: number
          release_year?: number
          rating?: string
          views?: number
          likes?: number
          size?: number
          created_at: string
          updated_at: string
          categories?: string[]
          tags?: string[]
          metadata?: Record<string, unknown>
          status: 'draft' | 'published' | 'archived'
          owner_id: string
          visibility: 'public' | 'private' | 'unlisted'
          encoding_status: 'pending' | 'processing' | 'completed' | 'failed'
          source_url?: string
          source_type?: string
          content_type: 'video' | 'audio' | 'document' | 'image'
          language?: string
          copyright?: string
          license?: string
          geographic_restrictions?: string[]
          age_restriction?: number
          monetization?: {
            enabled: boolean
            type?: 'subscription' | 'pay_per_view' | 'ad_supported'
            price?: number
            currency?: string
          }
        }
        Insert: Omit<
          Database['public']['Tables']['content']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['content']['Row']>
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
          encoding_settings?: {
            codec: string
            bitrate: number
            resolution: string
            audio_codec?: string
            audio_bitrate?: number
          }
          playback_info?: {
            duration: number
            thumbnail_timestamps: number[]
            chapters?: Array<{
              title: string
              start_time: number
              end_time: number
            }>
          }
        }
        Insert: Omit<
          Database['public']['Tables']['content_metadata']['Row'],
          'created_at'
        >
        Update: Partial<Database['public']['Tables']['content_metadata']['Row']>
      }
      content_categories: {
        Row: {
          content_id: string
          category_id: string
          created_at: string
          updated_at: string
          order?: number
        }
        Insert: Omit<
          Database['public']['Tables']['content_categories']['Row'],
          'created_at' | 'updated_at'
        >
        Update: Partial<
          Database['public']['Tables']['content_categories']['Row']
        >
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
          metadata?: {
            icon?: string
            color?: string
            featured?: boolean
            seo_title?: string
            seo_description?: string
          }
        }
        Insert: Omit<
          Database['public']['Tables']['categories']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['categories']['Row']>
      }
      content_tags: {
        Row: {
          content_id: string
          tag: string
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['content_tags']['Row'],
          'created_at'
        >
        Update: Partial<Database['public']['Tables']['content_tags']['Row']>
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          action: 'view' | 'download' | 'like' | 'comment' | 'rate'
          content_id?: string
          metadata?: Record<string, unknown>
          created_at: string
          ip_address?: string
          user_agent?: string
        }
        Insert: Omit<
          Database['public']['Tables']['user_activity']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['user_activity']['Row']>
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          device_id: string
          ip_address: string
          user_agent: string
          started_at: string
          ended_at?: string
          last_active_at: string
          is_active: boolean
          metadata?: Record<string, unknown>
        }
        Insert: Omit<
          Database['public']['Tables']['user_sessions']['Row'],
          'id' | 'started_at' | 'last_active_at'
        >
        Update: Partial<Database['public']['Tables']['user_sessions']['Row']>
      }
      permissions: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['permissions']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['permissions']['Row']>
      }
      role_permissions: {
        Row: {
          role: string
          permission_id: string
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['role_permissions']['Row'],
          'created_at'
        >
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive'
          tier: 'free' | 'premium' | 'premium_plus'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at?: string
          trial_start?: string
          trial_end?: string
          metadata?: Record<string, unknown>
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
      user_subscriptions: {
        Row: {
          user_id: string
          email: string
          full_name: string
          subscription_status: string
          subscription_tier: string
          current_period_end: string
          cancel_at_period_end: boolean
        }
      }
      active_subscriptions: {
        Row: {
          tier: string
          count: number
          total_revenue: number
        }
      }
      content_stats: {
        Row: {
          content_id: string
          views: number
          downloads: number
          likes: number
          average_rating: number
          comment_count: number
        }
      }
    }
    Functions: {
      get_user_permissions: {
        Args: { user_id: string }
        Returns: string[]
      }
      search_content: {
        Args: {
          query: string
          category_id?: string
          tag?: string
          limit?: number
          offset?: number
        }
        Returns: Content[]
      }
      get_user_activity_stats: {
        Args: {
          user_id: string
          start_date: string
          end_date: string
        }
        Returns: {
          total_views: number
          total_downloads: number
          active_days: number
          favorite_categories: Array<{ category: string; count: number }>
        }
      }
    }
    Enums: {
      subscription_status: SubscriptionStatus
      subscription_tier: SubscriptionTier
      content_status: 'draft' | 'published' | 'archived'
      download_quality: 'auto' | 'low' | 'medium' | 'high'
      user_role: UserRole
      activity_type: 'view' | 'download' | 'like' | 'comment' | 'rate'
    }
  }
}

// Export type aliases for convenience
export type Tables = Database['public']['Tables']
export type Views = Database['public']['Views']
export type Functions = Database['public']['Functions']
export type Enums = Database['public']['Enums']

// Export specific table types
export type UserProfile = Tables['user_profiles']['Row']
export type Content = Tables['content']['Row']
export type ContentMetadata = Tables['content_metadata']['Row']
export type Category = Tables['categories']['Row']
export type UserActivity = Tables['user_activity']['Row']
export type UserSession = Tables['user_sessions']['Row']
export type Subscription = Tables['subscriptions']['Row']
export type Permission = Tables['permissions']['Row']
