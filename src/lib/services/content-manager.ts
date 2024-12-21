import { vimeoService } from '@/lib/services/vimeo'
import { createClient } from '@/lib/supabase/client'
import type { Content, ContentMetadata, Playlist } from '@/types'

const supabase = createClient()

interface ContentFilters {
  id?: string
  category?: string
  tags?: string[]
  series?: string
  releaseYear?: number
  duration?: {
    min?: number
    max?: number
  }
}

interface ContentSort {
  field: 'title' | 'releaseYear' | 'views' | 'rating' | 'duration'
  direction: 'asc' | 'desc'
}

class ContentManager {
  private static instance: ContentManager

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager()
    }
    return ContentManager.instance
  }

  async getContent(
    filters?: ContentFilters,
    sort?: ContentSort
  ): Promise<Content | null> {
    // Get videos from Vimeo
    const videos = await vimeoService.getVideos({
      query: filters?.category,
      sort: sort?.field === 'title' ? 'name' : 'date',
      direction: sort?.direction || 'desc'
    })

    // Assuming we want the first video that matches the id
    const video = videos.find(v => v.uri.split('/').pop() === filters?.id);
    if (!video) return null; // Return null if no video found

    // Map Vimeo response to our Content type
    return {
      id: video.uri.split('/').pop() || '',
      title: video.name,
      description: video.description,
      thumbnail_url: video.pictures.base_link,
      duration: video.duration,
      category: filters?.category || '',
      release_year: new Date(video.created_time).getFullYear(),
      status: video.status,
      created_at: video.created_time,
      updated_at: video.modified_time
    };
  }

  async deleteContent(contentId: string): Promise<void> {
    // Delete video from Vimeo
    await vimeoService.deleteVideo(contentId)
  }

  async updateMetadata(
    contentId: string,
    metadata: Partial<ContentMetadata>
  ): Promise<void> {
    // Update video metadata on Vimeo
    await vimeoService.updateVideo(contentId, {
      name: metadata.title,
      description: metadata.description,
      privacy: { view: 'disable' }, // Adjust based on your needs
      ...metadata
    })
  }

  async createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): Promise<Playlist> {
    // Create a showcase on Vimeo
    const showcase = await vimeoService.createShowcase({
      name,
      description,
      privacy: { view: 'password' } // Adjust based on your needs
    })

    return {
      id: showcase.uri.split('/').pop() || '',
      user_id: userId,
      name: showcase.name,
      description: showcase.description || '',
      items: []
    }
  }

  async addToPlaylist(
    playlistId: string,
    contentId: string,
    position?: number
  ): Promise<void> {
    // Add video to Vimeo showcase
    await vimeoService.addToShowcase(playlistId, contentId)
  }

  async getRecommendations(userId: string, limit = 10): Promise<Content[]> {
    // Get recommended videos from Vimeo
    const videos = await vimeoService.getVideos({
      sort: 'plays',
      direction: 'desc',
      per_page: limit
    })

    return videos.map(video => ({
      id: video.uri.split('/').pop() || '',
      title: video.name,
      description: video.description,
      thumbnail_url: video.pictures.base_link,
      duration: video.duration,
      category: '',
      release_year: new Date(video.created_time).getFullYear(),
      status: video.status,
      created_at: video.created_time,
      updated_at: video.modified_time
    }))
  }
}

export const contentManager = ContentManager.getInstance()
