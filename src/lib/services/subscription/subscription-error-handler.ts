import { createClient } from '@/lib/supabase/server'
import type { SubscriptionError } from '@/types/subscription'

export function handleSubscriptionError(
  error: unknown,
  details?: Record<string, string>
): SubscriptionError {
  if (error instanceof Error) {
    return {
      name: 'SubscriptionError',
      code: 'subscription_error',
      message: error.message,
      originalError: error,
      details,
    }
  }

  return {
    name: 'SubscriptionError',
    code: 'unknown_error',
    message: 'An unknown error occurred with the subscription',
    details,
  }
}

export async function handleSyncError(
  error: unknown,
  jobId: string,
  userId: string
): Promise<void> {
  try {
    const supabase = await createClient()
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    // Update job status
    const { error: updateError } = await supabase
      .from('subscription_sync_jobs')
      .update({
        status: 'failed',
        error_message: errorMessage,
        processed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    if (updateError) throw updateError

    // Log error
    const { error: logError } = await supabase
      .from('subscription_sync_errors')
      .insert({
        job_id: jobId,
        user_id: userId,
        error_message: errorMessage,
        error_stack: error instanceof Error ? error.stack : undefined,
        created_at: new Date().toISOString(),
        severity: 'high',
      })

    if (logError) throw logError
  } catch (error) {
    console.error('Error handling sync error:', error)
    throw error
  }
}
