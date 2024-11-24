export interface Content {
  id: string
  title: string
  description: string
  vimeo_id: string
  vimeo_showcase_id?: string
  thumbnail_url: string
  duration: number
  created_at: string
  updated_at: string
  category: string
  tags: string[]
  privacy: {
    view: 'anybody' | 'disable' | 'unlisted'
    embed: 'private' | 'public'
  }
  status: 'available' | 'transcoding' | 'uploading'
} 