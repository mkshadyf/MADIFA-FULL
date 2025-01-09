import { createClient } from '@/lib/supabase/server'

export async function handleRetry(
  jobId: string,
  userId: string
): Promise<void> {
  try {
    const supabase = await createClient()

    // Get the current job
    const { data: job, error: jobError } = await supabase
      .from('subscription_sync_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError

    if (!job) {
      throw new Error('Job not found')
    }

    // Update retry count and next retry time
    const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
    const { error: updateError } = await supabase
      .from('subscription_sync_jobs')
      .update({
        retry_count: job.retry_count + 1,
        next_retry_at: nextRetryAt.toISOString(),
        status: 'pending',
      })
      .eq('id', jobId)

    if (updateError) throw updateError

    // Log the retry attempt
    const { error: logError } = await supabase
      .from('subscription_sync_errors')
      .insert({
        job_id: jobId,
        user_id: userId,
        error_message: 'Retry attempt initiated',
        created_at: new Date().toISOString(),
        severity: 'low',
      })

    if (logError) throw logError
  } catch (error) {
    console.error('Error handling retry:', error)
    throw error
  }
}
