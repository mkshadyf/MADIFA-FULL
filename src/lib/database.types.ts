export interface Content {
  id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: number
  category: string
  release_year: number
  tags: string[]
  is_public: boolean
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  creator_id: string
  views: number
  rating: number
  featured: boolean
}

export interface User {
  id: string
  email: string
  email_verified: boolean
  full_name: string
  role: 'user' | 'admin' | 'moderator'
  subscription_status: 'active' | 'cancelled' | 'inactive'
  subscription_tier: 'free' | 'premium' | 'premium_plus'
  created_at: string
  sendEmailVerification: () => Promise<void>
}

export interface Playlist {
  id: string
  title: string
  description: string
  content_ids: string[]
  created_at: string
  updated_at: string
  creator_id: string
}

export interface Permission {
  id: string
  name: string
  roles: ('user' | 'admin' | 'moderator')[]
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'email_verified' | 'sendEmailVerification'>>
      }
      content: {
        Row: Content
        Insert: Omit<Content, 'id' | 'created_at' | 'updated_at' | 'views' | 'rating'>
        Update: Partial<Omit<Content, 'id' | 'created_at' | 'updated_at'>>
      }
      content_metadata: {
        Row: {
          id: string
          content_id: string
          language: string
          quality: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_metadata']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['content_metadata']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      playlists: {
        Row: Playlist
        Insert: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Playlist, 'id' | 'created_at' | 'updated_at'>>
      }
      permissions: {
        Row: Permission
        Insert: Omit<Permission, 'id'>
        Update: Partial<Omit<Permission, 'id'>>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'cancelled' | 'inactive'
          stripe_customer_id: string
          stripe_subscription_id: string
          current_period_end: string
          cancel_at_period_end: boolean
          payment_method_id: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      downloads: {
        Row: {
          id: string
          user_id: string
          content_id: string
          status: 'pending' | 'downloading' | 'completed' | 'failed'
          progress: number
          error?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['downloads']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['downloads']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          content_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['favorites']['Row'], 'id' | 'created_at'>>
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          content_id: string
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['ratings']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      comments: {
        Row: {
          id: string
          user_id: string
          content_id: string
          text: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      history: {
        Row: {
          id: string
          user_id: string
          content_id: string
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['history']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['history']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>>
      }
      admin_stats: {
        Row: {
          id: string
          total_users: number
          total_content: number
          total_views: number
          total_downloads: number
          total_revenue: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_stats']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Database['public']['Tables']['admin_stats']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
