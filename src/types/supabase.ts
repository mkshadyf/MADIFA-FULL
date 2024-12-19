import type { Database } from '@/lib/database.types'

export type Tables = Database['public']['Tables']

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
