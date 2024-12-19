import { useEffect, useRef } from 'react'
import type { Content } from '@/types'

import { downloadsManager } from '@/lib/services/downloads'
import { createClient } from '@/lib/supabase/client'

import { useAuth } from './useAuth'
import { useToast } from './useToast'

const supabase = createClient()

interface DownloadRecord {
  id: string
  user_id: string
  content_id: string
  blob_url: string
  size: number
  downloaded_at: string
  last_accessed: string
  metadata: Record<string, any>
}

export function useDownloadPersistence() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const syncTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!user) return

    const loadDownloadsFromDB = async () => {
      try {
        const { data, error } = await supabase
          .from('downloads')
          .select('*')
          .eq('user_id', user.id)

        if (error) throw error

        // Restore downloads from database records
        for (const record of data) {
          try {
            // Verify blob still exists
            const response = await fetch(record.blob_url, { method: 'HEAD' })
            if (!response.ok) {
              // Blob is missing, remove record
              await supabase.from('downloads').delete().eq('id', record.id)
              continue
            }

            // Update last accessed time
            await supabase
              .from('downloads')
              .update({ last_accessed: new Date().toISOString() })
              .eq('id', record.id)
          } catch (error) {
            logger.error(`Failed to verify download ${record.id}:`, error)
          }
        }
      } catch (error) {
        logger.error('Failed to load downloads:', error)
        showToast('Failed to load downloads', 'error')
      }
    }

    const handleDownloadComplete = async (
      content: Content,
      blobUrl: string
    ) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase.from('downloads').upsert({
            user_id: user.id,
            content_id: content.id,
            blob_url: blobUrl,
            size: content.size || 0,
            metadata: {
              title: content.title,
              thumbnail_url: content.thumbnail_url,
            },
          })

          if (error) throw error
        } catch (error) {
          logger.error('Failed to save download:', error)
          showToast('Failed to save download', 'error')
        }
      }, 1000)
    }

    const handleDownloadRemoved = async (contentId: string) => {
      try {
        const { error } = await supabase
          .from('downloads')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId)

        if (error) throw error
      } catch (error) {
        logger.error('Failed to remove download record:', error)
        showToast('Failed to remove download record', 'error')
      }
    }

    loadDownloadsFromDB()

    // Subscribe to download events
    downloadsManager.on('downloadComplete', handleDownloadComplete)
    downloadsManager.on('downloadRemoved', handleDownloadRemoved)

    return () => {
      downloadsManager.off('downloadComplete', handleDownloadComplete)
      downloadsManager.off('downloadRemoved', handleDownloadRemoved)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [user, showToast])

  // No need to return anything as this hook just handles persistence
  return null
}
