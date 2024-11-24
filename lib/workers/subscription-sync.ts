import { syncSubscriptionAccess } from '@/lib/services/subscription-sync'
import { createClient } from '@/lib/supabase/server'

interface SyncJob {
  id: string
  subscription_id: string
  user_id: string
  action: 'grant' | 'revoke'
}

export async function processSyncJobs() {
  const supabase = createClient()

  try {
    // Get pending jobs
    const { data: jobs, error } = await supabase
      .from('subscription_sync_jobs')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (error) throw error
    if (!jobs?.length) return

    // Process each job
    await Promise.all(
      jobs.map(async (job: SyncJob) => {
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
          // Log failure
          await supabase
            .from('subscription_sync_jobs')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              processed_at: new Date().toISOString()
            })
            .eq('id', job.id)
        }
      })
    )
  } catch (error) {
    console.error('Error processing sync jobs:', error)
    throw error
  }
} 