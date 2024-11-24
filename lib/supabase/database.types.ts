export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string
          avatar_url: string | null
          pin_code: string | null
          role: 'admin' | 'moderator' | 'user'
          subscription_tier: 'free' | 'premium' | 'premium_plus'
          subscription_status: 'active' | 'inactive' | 'past_due'
          current_profile_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name: string
          avatar_url?: string | null
          pin_code?: string | null
          role?: 'admin' | 'moderator' | 'user'
          subscription_tier?: 'free' | 'premium' | 'premium_plus'
          subscription_status?: 'active' | 'inactive' | 'past_due'
          current_profile_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          pin_code?: string | null
          role?: 'admin' | 'moderator' | 'user'
          subscription_tier?: 'free' | 'premium' | 'premium_plus'
          subscription_status?: 'active' | 'inactive' | 'past_due'
          current_profile_id?: string | null
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
          category: string
          release_year: number
          duration: number
          status: 'processing' | 'ready' | 'failed'
          error_message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          thumbnail_url: string
          video_url: string
          category: string
          release_year: number
          duration: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          thumbnail_url?: string
          video_url?: string
          category?: string
          release_year?: number
          duration?: number
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          avatar_url: string | null
          pin_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          avatar_url?: string | null
          pin_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string | null
          pin_code?: string | null
          updated_at?: string
        }
      }
    }
  }
} 