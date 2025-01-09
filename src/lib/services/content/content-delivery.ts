import { createClient } from '@/lib/supabase'

interface DatabaseContent {
  id: string
  user_id: string
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: number
  category_id: string
  created_at: string
  updated_at: string
  views: number
  rating: number | null
  size: number
  category: string
  tags: string[]
  fileSize: number
  type: 'video' | 'audio' | 'document' | 'image'
  status: 'draft' | 'published' | 'archived'
  visibility: 'public' | 'private' | 'unlisted'
  encoding_status?: 'pending' | 'processing' | 'completed' | 'failed'
  expiration_date?: string
  vimeo_id?: string
  metadata?: Record<string, unknown>
}
