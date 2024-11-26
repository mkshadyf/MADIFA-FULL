export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: string
          subscription_tier: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          role?: string
          subscription_tier?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          role?: string
          subscription_tier?: string
          subscription_status?: string
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
          category: string
          release_year: number
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          thumbnail_url?: string
          video_url?: string
          category?: string
          release_year?: number
          created_at?: string
          updated_at?: string
        }
      }
      admin_stats: {
        Row: {
          id: string
          // ... add other fields
        }
      }
      vimeo_content: {
        Row: {
          id: string
          // ... add other fields
        }
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
