export type Database = {
  public: {
    Tables: {
      watch_history: {
        Row: {
          id: string
          user_id: string
          vimeo_id: string
          progress: number
          last_watched: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vimeo_id: string
          progress: number
          last_watched?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vimeo_id?: string
          progress?: number
          last_watched?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 