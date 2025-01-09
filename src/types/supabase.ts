export interface Database {
  public: {
    Tables: {
      user_interactions: {
        Row: {
          id: string
          user_id: string
          content_id: string
          type: 'favorite' | 'rating' | 'watchlist'
          value?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          content_id: string
          type: 'favorite' | 'rating' | 'watchlist'
          value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          content_id?: string
          type?: 'favorite' | 'rating' | 'watchlist'
          value?: number
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
          metadata?: {
            icon?: string
            color?: string
            featured?: boolean
            seo_title?: string
            seo_description?: string
          }
        }
        Insert: Omit<
          Tables['categories']['Row'],
          'id' | 'created_at' | 'updated_at'
        >
        Update: Partial<Tables['categories']['Row']>
      }
      // Add other tables as needed
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

export type Tables = Database['public']['Tables']
export type UserInteraction = Tables['user_interactions']['Row']
