import { downloadQueueManager } from '@/lib/services/download-queue'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

const supabase = createClient()

export function useDownloadQueueSync() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const syncTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!user) return

    const loadQueueFromDB = async () => {
      try {
        const { data, error } = await supabase
          .from('download_queue')
          .select('*')
          .eq('user_id', user.id)
          .order('priority', { ascending: false })

        if (error) throw error

        // Restore queue state
        await downloadQueueManager.restoreQueue(data)
      } catch (error) {
        console.error('Failed to load download queue:', error)
        showToast('Failed to load download queue', 'error')
      }
    }

    const handleQueueUpdate = async (items: any[]) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      // Debounce sync to avoid too many DB writes
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          // First, remove all existing queue items
          await supabase
            .from('download_queue')
            .delete()
            .eq('user_id', user.id)

          // Then insert new queue state
          if (items.length > 0) {
            const { error } = await supabase
              .from('download_queue')
              .insert(items.map(item => ({
                user_id: user.id,
                content_id: item.content.id,
                priority: item.priority,
                status: item.status,
                progress: item.progress,
                error: item.error,
                metadata: item.metadata
              })))

            if (error) throw error
          }
        } catch (error) {
          console.error('Failed to sync download queue:', error)
          showToast('Failed to sync download queue', 'error')
        }
      }, 1000)
    }

    loadQueueFromDB()

    // Subscribe to queue updates
    const unsubscribe = downloadQueueManager.subscribe(handleQueueUpdate)

    return () => {
      unsubscribe()
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [user, showToast])

  // No need to return anything as this hook just handles sync
  return null
} 