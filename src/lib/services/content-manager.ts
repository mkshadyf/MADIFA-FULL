import { createAPIError, createErrorContext } from '@/lib/utils/error-handler'
import type { Content, ContentStatus } from '@/types'
import type { VimeoPrivacy, VimeoVideo, VimeoVideoStatus } from '@/types/vimeo'
import { vimeoService } from './vimeo'

interface ContentManagerOptions {
  vimeoService: typeof vimeoService
}

export class ContentManager {
  private vimeoService: typeof vimeoService

  constructor(options: ContentManagerOptions) {
    this.vimeoService = options.vimeoService
  }

  private mapVimeoStatus(status: VimeoVideoStatus): ContentStatus {
    switch (status) {
      case 'uploading':
      case 'transcoding':
        return 'processing'
      case 'available':
        return 'ready'
      case 'error':
        return 'error'
      default:
        return 'processing'
    }
  }

  private mapVimeoVideoToContent(video: VimeoVideo): Content {
    const thumbnailUrl = video.pictures?.sizes?.[0]?.link || null

    return {
      id: video.uri.split('/').pop() || '',
      title: video.name,
      description: video.description,
      thumbnail_url: thumbnailUrl,
      video_url: video.link || null,
      duration: video.duration,
      size: video.size || null,
      status: this.mapVimeoStatus(video.status),
      category: video.categories?.[0]?.name || 'Uncategorized',
      tags: (video.categories || []).flatMap(cat =>
        [cat.name, ...(cat.subcategories?.map(sub => sub.name) || [])]
      ),
      created_at: video.created_time,
      updated_at: video.modified_time,
      release_year: new Date(video.created_time).getFullYear(),
      metadata: {
        title: video.name,
        description: video.description || undefined,
        video_url: video.link,
        thumbnail_url: thumbnailUrl || undefined,
        size: video.size || undefined,
        duration: video.duration,
        status: this.mapVimeoStatus(video.status)
      }
    }
  }
  async updateMetadata(id: string, metadata: Partial<Content>): Promise<Content> {
    try {
      const video = await this.vimeoService.updateVideo(id, {
        name: metadata.title,
        description: metadata.description,
        categories: metadata.category ? [{
          uri: `/categories/${metadata.category.toLowerCase()}`,
          name: metadata.category,
          subcategories: metadata.tags?.map(tag => ({
            uri: `/subcategories/${tag.toLowerCase()}`,
            name: tag
          }))
        }] : undefined
      })
      return this.mapVimeoVideoToContent(video)
    } catch (error) {
      throw createAPIError(
        'Failed to update content metadata',
        'UPDATE_METADATA_ERROR',
        createErrorContext('contentManager', 'updateMetadata', { id })
      )
    }
  }

  async deleteContent(id: string): Promise<void> {
    try {
      await this.vimeoService.deleteVideo(id)
    } catch (error) {
      throw createAPIError(
        'Failed to delete content',
        'DELETE_CONTENT_ERROR',
        createErrorContext('contentManager', 'deleteContent', { id })
      )
    }
  }
  async getContent(id: string): Promise<Content> {
    try {
      const video = await this.vimeoService.getVideo(id)
      return this.mapVimeoVideoToContent(video)
    } catch (error) {
      throw createAPIError(
        'Failed to get content',
        'GET_CONTENT_ERROR',
        createErrorContext('contentManager', 'getContent', { id })
      )
    }
  }

  async listContent(options: { page?: number; per_page?: number } = {}): Promise<Content[]> {
    try {
      const videos = await this.vimeoService.getVideos(options)
      return videos.map(video => this.mapVimeoVideoToContent(video))
    } catch (error) {
      throw createAPIError(
        'Failed to list content',
        'LIST_CONTENT_ERROR',
        createErrorContext('contentManager', 'listContent')
      )
    }
  }

  async createContent(file: File, metadata: {
    name: string
    description?: string
    privacy?: VimeoPrivacy
  }): Promise<Content> {
    try {
      const video = await this.vimeoService.uploadVideo(file, {
        name: metadata.name,
        description: metadata.description,
        privacy: metadata.privacy || {
          view: 'disable',
          embed: 'private',
          download: false,
          comments: 'nobody'
        }
      })
      return this.mapVimeoVideoToContent(video)
    } catch (error) {
      throw createAPIError(
        'Failed to create content',
        'CREATE_CONTENT_ERROR',
        createErrorContext('contentManager', 'createContent')
      )
    }
  }

  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    try {
      const video = await this.vimeoService.updateVideo(id, {
        name: updates.title,
        description: updates.description
      })
      return this.mapVimeoVideoToContent(video)
    } catch (error) {
      throw createAPIError(
        'Failed to update content',
        'UPDATE_CONTENT_ERROR',
        createErrorContext('contentManager', 'updateContent', { id })
      )
    }
  }

  // async deleteContent(id: string): Promise<void> {
  //   try {
  //     await this.vimeoService.deleteVideo(id)
  //   } catch (error) {
  //     throw createAPIError(
  //       'Failed to delete content',
  //       'DELETE_CONTENT_ERROR',
  //       createErrorContext('contentManager', 'deleteContent', { id })
  //     )
  //   }
  // }

  async searchContent(query: string): Promise<Content[]> {
    try {
      const videos = await this.vimeoService.getVideos({ per_page: 20 })
      return videos
        .filter(video =>
          video.name.toLowerCase().includes(query.toLowerCase()) ||
          (video.description?.toLowerCase() || '').includes(query.toLowerCase())
        )
        .map(video => this.mapVimeoVideoToContent(video))
    } catch (error) {
      throw createAPIError(
        'Failed to search content',
        'SEARCH_CONTENT_ERROR',
        createErrorContext('contentManager', 'searchContent', { query })
      )
    }
  }

  async getContentByCategory(category: string): Promise<Content[]> {
    try {
      const videos = await this.vimeoService.getVideos({ per_page: 50 })
      return videos
        .filter(video => video.categories?.some(cat => cat.name === category))
        .map(video => this.mapVimeoVideoToContent(video))
    } catch (error) {
      throw createAPIError(
        'Failed to get content by category',
        'GET_CONTENT_BY_CATEGORY_ERROR',
        createErrorContext('contentManager', 'getContentByCategory', { category })
      )
    }
  }
}
