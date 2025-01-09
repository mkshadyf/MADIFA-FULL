import { createClient } from '@/lib/supabase/server'

import { syncSubscriptionAccess } from './subscription-sync'

export async function retryFailedSyncJobs() {
  try {
    const supabase = await createClient()

    // Get failed jobs
    const { data: jobs, error } = await supabase
      .from('subscription_sync_jobs')
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) throw error
    if (!jobs?.length) return

    // Process each failed job
    await Promise.all(
      jobs.map(async job => {
        try {
          await syncSubscriptionAccess(job.user_id)

          // Update job status
          const { error: updateError } = await supabase
            .from('subscription_sync_jobs')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
              error_message: null,
            })
            .eq('id', job.id)

          if (updateError) throw updateError
        } catch (error) {
          // Update retry count and error
          const { error: retryError } = await supabase
            .from('subscription_sync_jobs')
            .update({
              error_message:
                error instanceof Error ? error.message : 'Unknown error',
              retry_count: (job.retry_count || 0) + 1,
              processed_at: new Date().toISOString(),
            })
            .eq('id', job.id)

          if (retryError) throw retryError
        }
      })
    )
  } catch (error) {
    console.error('Error retrying sync jobs:', error)
    throw error
  }
}
