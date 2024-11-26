import { createClient } from '@/lib/supabase/server'
import { handleSyncError } from './subscription-error-handler'
import { syncSubscriptionAccess } from './subscription-sync'

interface RetryStrategy {
  maxRetries: number
  backoffMinutes: number[]
}

const retryStrategy: RetryStrategy = {
  maxRetries: 3,
  backoffMinutes: [5, 15, 60] // Exponential backoff
}

export async function handleRetry(jobId: string, userId: string) {
  const supabase = createClient()

  try {
    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('subscription_sync_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError

    // Check retry count
    if (job.retry_count >= retryStrategy.maxRetries) {
      await handleSyncError(
        new Error(`Max retries (${retryStrategy.maxRetries}) exceeded`),
        jobId,
        userId
      )
      return
    }

    // Calculate next retry time
    const backoffMinutes = retryStrategy.backoffMinutes[job.retry_count] || 60
    const nextRetry = new Date()
    nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes)

    try {
      // Attempt sync
      await syncSubscriptionAccess(userId)

      // Update job status on success
      await supabase
        .from('subscription_sync_jobs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', jobId)

    } catch (syncError) {
      // Increment retry count and schedule next attempt
      await supabase
        .from('subscription_sync_jobs')
        .update({
          retry_count: job.retry_count + 1,
          next_retry_at: nextRetry.toISOString(),
          error_message: syncError instanceof Error ? syncError.message : 'Unknown error'
        })
        .eq('id', jobId)

      throw syncError
    }
  } catch (error) {
    console.error('Error handling retry:', error)
    throw error
  }
} 
