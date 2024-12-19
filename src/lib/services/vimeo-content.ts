import type { VimeoVideo } from '@/types/vimeo'

import { vimeoService } from './vimeo'

interface ContentHierarchy {
  folders: {
    id: string
    name: string
    videos: VimeoVideo[]
    subfolders?: ContentHierarchy[]
  }[]
}

class VimeoContentManager {
  private static instance: VimeoContentManager
  private contentHierarchy: ContentHierarchy | null = null
  private lastSyncTime: Date | null = null

  static getInstance(): VimeoContentManager {
    if (!VimeoContentManager.instance) {
      VimeoContentManager.instance = new VimeoContentManager()
    }
    return VimeoContentManager.instance
  }

  async syncContentHierarchy(): Promise<ContentHierarchy> {
    try {
      const folders = await vimeoService.getFolders()
      const hierarchy: ContentHierarchy = { folders: [] }

      for (const folder of folders) {
        const videos = await vimeoService.getVideosByFolder(
          folder.uri.split('/').pop()!
        )
        hierarchy.folders.push({
          id: folder.uri,
          name: folder.name,
          videos,
          subfolders: [], // Support for nested folders if needed
        })
      }

      this.contentHierarchy = hierarchy
      this.lastSyncTime = new Date()
      return hierarchy
    } catch (error) {
      logger.error('Error syncing content hierarchy:', error)
      throw error
    }
  }

  async getContentByCategory(category: string): Promise<VimeoVideo[]> {
    if (!this.contentHierarchy) {
      await this.syncContentHierarchy()
    }

    const folder = this.contentHierarchy!.folders.find(
      f => f.name.toLowerCase() === category.toLowerCase()
    )
    return folder?.videos || []
  }

  async searchContent(query: string): Promise<VimeoVideo[]> {
    if (!this.contentHierarchy) {
      await this.syncContentHierarchy()
    }

    const allVideos = this.contentHierarchy!.folders.flatMap(f => f.videos)
    return allVideos.filter(
      video =>
        video.name.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  async getFeaturedContent(): Promise<VimeoVideo[]> {
    const featuredFolder = await vimeoService.getFolderByName('Featured')
    if (featuredFolder) {
      return vimeoService.getVideosByFolder(
        featuredFolder.uri.split('/').pop()!
      )
    }
    return []
  }
}

export const vimeoContentManager = VimeoContentManager.getInstance()
