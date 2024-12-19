export interface Database {
  public: {
    Tables: {
      content: {
        Row: {
          id: string
          title: string
          description: string
          thumbnail_url: string
          video_url: string
          duration: number
          views: number
          featured: boolean
          created_at: string
          updated_at: string
        }
      }
      content_metadata: {
        Row: {
          id: string
          content_id: string
          language: string
          subtitles: boolean
          quality: string
          size: number
          format: string
          created_at: string
          updated_at: string
        }
      }
      content_categories: {
        Row: {
          id: string
          content_id: string
          category_id: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          role: string
          subscription_tier: string | undefined
          subscription_status: 'active' | 'cancelled' | 'past_due' | undefined
          created_at: string
          updated_at: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          features: string[]
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Content = Tables<'content'>
export type ContentMetadata = Tables<'content_metadata'>
