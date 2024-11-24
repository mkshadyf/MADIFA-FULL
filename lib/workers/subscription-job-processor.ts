import { handleSyncError } from '@/lib/services/subscription-error-handler'
import { syncSubscriptionAccess } from '@/lib/services/subscription-sync'
import { createClient } from '@/lib/supabase/server'

interface JobBatch {
  size: number
  maxRetries: number
  interval: number
}

const BATCH_CONFIG: JobBatch = {
  size: 10,
  maxRetries: 3,
  interval: 1000 * 60 // 1 minute
}

export async function processSyncJobBatch() {
  const supabase = createClient()
  let isProcessing = false

  const processJobs = async () => {
    if (isProcessing) return
    isProcessing = true

    try {
      // Get batch of pending jobs
      const { data: jobs, error } = await supabase
        .from('subscription_sync_jobs')
        .select('*')
        .eq('status', 'pending')
        .lt('retry_count', BATCH_CONFIG.maxRetries)
        .order('created_at', { ascending: true })
        .limit(BATCH_CONFIG.size)

      if (error) throw error
      if (!jobs?.length) return

      // Process jobs in parallel
      await Promise.allSettled(
        jobs.map(async (job) => {
          try {
            await syncSubscriptionAccess(job.user_id)

            // Update job status
            await supabase
              .from('subscription_sync_jobs')
              .update({
                status: 'completed',
                processed_at: new Date().toISOString()
              })
              .eq('id', job.id)

          } catch (error) {
            await handleSyncError(
              error instanceof Error ? error : new Error('Unknown error'),
              job.id,
              job.user_id
            )

            // Increment retry count
            await supabase
              .from('subscription_sync_jobs')
              .update({
                retry_count: (job.retry_count || 0) + 1
              })
              .eq('id', job.id)
          }
        })
      )
    } catch (error) {
      console.error('Error processing job batch:', error)
    } finally {
      isProcessing = false
    }
  }

  // Start processing loop
  setInterval(processJobs, BATCH_CONFIG.interval)
} 