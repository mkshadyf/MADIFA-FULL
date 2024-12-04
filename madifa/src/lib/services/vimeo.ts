import { createClient } from '@/lib/supabase/client'
import type { VimeoVideo } from '@/types/vimeo'
import { Vimeo } from '@vimeo/vimeo'

class VimeoService {
  private client: Vimeo
  private supabase = createClient()

  constructor() {
    this.client = new Vimeo(
      process.env.VITE_VIMEO_CLIENT_ID!,
      process.env.VITE_VIMEO_CLIENT_SECRET!,
      process.env.VITE_VIMEO_ACCESS_TOKEN!
    )
  }

  async getFolders(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.client.request({
        method: 'GET',
        path: '/me/projects'
      }, (error, result) => {
        if (error) reject(error)
        resolve(result.data)
      })
    })
  }

  async getVideosByFolder(folderId: string): Promise<VimeoVideo[]> {
    return new Promise((resolve, reject) => {
      this.client.request({
        method: 'GET',
        path: `/me/projects/${folderId}/videos`
      }, (error, result) => {
        if (error) reject(error)
        resolve(result.data)
      })
    })
  }

  async getVideoStream(videoId: string): Promise<string> {
    const video = await this.getVideoMetadata(videoId)
    const file = video.files.find(f => f.quality === '720p')
    if (!file) throw new Error('No HD stream available')
    return file.link
  }

  async getVideoMetadata(videoId: string): Promise<VimeoVideo> {
    return new Promise((resolve, reject) => {
      this.client.request({
        method: 'GET',
        path: `/videos/${videoId}`
      }, (error, result) => {
        if (error) reject(error)
        resolve(result)
      })
    })
  }

  async syncFolders(): Promise<void> {
    const folders = await this.getFolders()
    await this.syncFoldersToDatabase(folders)
  }

  async syncVideos(folderId: string): Promise<void> {
    const videos = await this.getVideosByFolder(folderId)
    await this.syncVideosToDatabase(videos, folderId)
  }

  private async syncFoldersToDatabase(folders: any[]) {
    const { error } = await this.supabase
      .from('vimeo_folders')
      .upsert(
        folders.map(folder => ({
          folder_id: folder.uri.split('/').pop(),
          name: folder.name,
          sync_status: 'synced'
        }))
      )
    if (error) throw error
  }

  private async syncVideosToDatabase(videos: VimeoVideo[], folderId: string) {
    const { error } = await this.supabase
      .from('content')
      .upsert(
        videos.map(video => ({
          video_id: video.uri.split('/').pop(),
          title: video.name,
          description: video.description,
          duration: video.duration,
          folder_id: folderId,
          thumbnail_url: video.pictures.sizes[3].link,
          video_url: video.files[0].link
        }))
      )
    if (error) throw error
  }
}

export const vimeoService = new VimeoService() 
