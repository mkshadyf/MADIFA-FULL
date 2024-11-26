import { createClient } from '@/lib/supabase/client'
import { getVideoDetails } from './vimeo'

export async function syncVimeoContent(videoId: string) {
  const supabase = createClient()

  try {
    // Get video details from Vimeo
    const vimeoDetails = await getVideoDetails(videoId)

    // Update sync status
    const { error } = await supabase
      .from('vimeo_sync')
      .upsert({
        vimeo_id: videoId,
        last_synced: new Date().toISOString(),
        metadata: vimeoDetails,
        status: 'synced'
      })

    if (error) throw error

    // Log sync event
    await supabase
      .from('vimeo_sync_log')
      .insert({
        vimeo_id: videoId,
        event_type: 'sync',
        details: vimeoDetails
      })

    return vimeoDetails
  } catch (error) {
    console.error('Error syncing Vimeo content:', error)

    // Update sync status as failed
    await supabase
      .from('vimeo_sync')
      .upsert({
        vimeo_id: videoId,
        last_synced: new Date().toISOString(),
        status: 'failed'
      })

    // Log error
    await supabase
      .from('vimeo_sync_log')
      .insert({
        vimeo_id: videoId,
        event_type: 'error',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      })

    throw error
  }
} 
