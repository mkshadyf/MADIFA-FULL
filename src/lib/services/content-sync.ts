import type { Content, VimeoVideo } from '@/types'

import { createClient } from '@/lib/supabase/client'

import { vimeoService } from './vimeo'

const supabase = createClient()

class ContentSyncService {
  private static instance: ContentSyncService
  private syncInProgress = false
  private lastSyncTime: Date | null = null

  private constructor() {}

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
      const videos = folderId
        ? await vimeoService.getVideosByFolder(folderId)
        : await vimeoService.getAllVideos()

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
    return {
      id: video.uri.split('/').pop()!,
      title: video.name,
      description: video.description,
      thumbnail_url: video.pictures.sizes[3].link, // HD thumbnail
      video_url: video.player_embed_url,
      duration: video.duration,
      category: video.categories[0]?.name || 'uncategorized',
      tags: video.tags.map(tag => tag.name),
      release_year: new Date(video.created_time).getFullYear(),
      created_at: new Date(video.created_time).toISOString(),
      updated_at: new Date(video.modified_time).toISOString(),
      metadata: {
        width: video.width,
        height: video.height,
        fps: video.fps,
        quality: video.quality,
        status: video.status,
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
    this.lastSyncTime = new Date()
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
