import { createClient } from '@/lib/supabase'
import type { Content } from '@/types/content'
import type { VimeoCategory, VimeoVideo } from '@/types/vimeo'
import { vimeoService } from '../vimeo'

const supabase = createClient()

class ContentSyncService {
  private static instance: ContentSyncService
  private syncInProgress = false

  private constructor() {
    this.transformVimeoVideo = this.transformVimeoVideo.bind(this)
  }

  static getInstance(): ContentSyncService {
    if (!ContentSyncService.instance) {
      ContentSyncService.instance = new ContentSyncService()
    }
    return ContentSyncService.instance
  }

  async syncContent(folderId?: string): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Content sync already in progress')
    }

    try {
      this.syncInProgress = true
      console.log('Starting content sync...')

      // Get videos from Vimeo
      const videos = (
        folderId
          ? await vimeoService.getVideosByFolder(folderId)
          : await vimeoService.getAllVideos()
      ) as VimeoVideo[]

      // Transform to content format
      const contentRecords = videos.map(this.transformVimeoVideo)

      // Batch upsert to Supabase
      const batchSize = 100
      for (let i = 0; i < contentRecords.length; i += batchSize) {
        const batch = contentRecords.slice(i, i + batchSize)
        const { error } = await supabase.from('content').upsert(batch, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })

        if (error) throw error
      }

      // Update sync metadata
      await this.updateSyncMetadata()

      console.log(`Synced ${contentRecords.length} videos successfully`)
    } catch (error) {
      console.error('Content sync failed:', error)
      throw error
    } finally {
      this.syncInProgress = false
    }
  }

  private transformVimeoVideo(video: VimeoVideo): Content {
    const videoId = video.uri.split('/').pop()!
    const defaultCategory = 'uncategorized'
    const hdThumbnail =
      video.pictures?.sizes?.find(s => s.width >= 1280)?.link ||
      video.pictures?.sizes?.[0]?.link ||
      ''
    const hdFile = video.files?.find(f => f.quality === 'hd')
    const metadata = video.metadata || {}
    const categories = (metadata.connections?.categories?.data ||
      []) as VimeoCategory[]

    return {
      id: videoId,
      title: video.name,
      description: video.description || '',
      thumbnail_url: hdThumbnail,
      video_url: video.link,
      preview_url: hdThumbnail,
      duration: video.duration,
      category_id: categories[0]?.uri || defaultCategory,
      category: categories[0]?.name || defaultCategory,
      tags: categories.map(c => c.name),
      fileSize: hdFile?.size || 0,
      size: hdFile?.size || 0,
      views: video.stats?.plays || 0,
      rating: null,
      created_at: video.created_time,
      updated_at: video.modified_time,
      owner_id: video.uri.split('/')[1] || '', // Vimeo URIs are in format /users/{id}/videos/{video_id}
      content_type: 'video',
      type: 'video',
      status: 'published',
      visibility: video.privacy.view === 'anybody' ? 'public' : 'private',
      vimeo_id: videoId,
      metadata: {
        width: hdFile?.width || 0,
        height: hdFile?.height || 0,
        fps: hdFile?.fps || undefined,
        quality: hdFile?.quality || 'unknown',
        categories: categories.map(c => c.name),
        files:
          video.files?.map(file => ({
            quality: file.quality,
            type: file.type,
            width: file.width,
            height: file.height,
            link: file.link,
            size: file.size || 0,
          })) || [],
        pictures:
          video.pictures?.sizes?.map(size => ({
            width: size.width,
            height: size.height,
            link: size.link,
          })) || [],
      },
    }
  }

  private async updateSyncMetadata() {
    const { error } = await supabase.from('sync_metadata').upsert({
      id: 'vimeo',
      last_sync: new Date().toISOString(),
      status: 'success',
    })

    if (error) throw error
  }

  async getSyncStatus() {
    const { data, error } = await supabase
      .from('sync_metadata')
      .select('*')
      .eq('id', 'vimeo')
      .single()

    if (error) throw error

    return {
      lastSync: data?.last_sync ? new Date(data.last_sync) : null,
      status: data?.status || 'unknown',
      inProgress: this.syncInProgress,
    }
  }

  async scheduleSync(cronExpression: string) {
    const { error } = await supabase.from('sync_schedules').upsert({
      id: 'vimeo',
      cron_expression: cronExpression,
      enabled: true,
    })

    if (error) throw error
  }

  async cleanupOrphanedContent(): Promise<void> {
    try {
      // Get all content IDs from Supabase
      const { data: localContent, error: fetchError } = await supabase
        .from('content')
        .select('id')

      if (fetchError) throw fetchError

      // Get all video IDs from Vimeo
      const vimeoVideos = await vimeoService.getAllVideos()
      const vimeoIds = new Set(vimeoVideos.map(v => v.uri.split('/').pop()!))

      // Find orphaned content
      const orphanedIds =
        localContent?.filter(c => !vimeoIds.has(c.id)).map(c => c.id) || []

      if (orphanedIds.length > 0) {
        // Delete orphaned content in batches
        const batchSize = 100
        for (let i = 0; i < orphanedIds.length; i += batchSize) {
          const batch = orphanedIds.slice(i, i + batchSize)
          const { error } = await supabase
            .from('content')
            .delete()
            .in('id', batch)

          if (error) throw error
        }

        console.log(`Cleaned up ${orphanedIds.length} orphaned content items`)
      }
    } catch (error) {
      console.error('Content cleanup failed:', error)
      throw error
    }
  }
}

export const contentSyncService = ContentSyncService.getInstance()
