import { sendNotification } from '@/lib/services/notifications'
import { createClient } from '@/lib/supabase/server'

interface ErrorLog {
  id: string
  job_id: string
  error_message: string
  stack_trace?: string
  created_at: string
}

export async function handleSyncError(
  error: Error,
  jobId: string,
  userId: string
) {
  const supabase = createClient()

  try {
    // Log error
    const { data: errorLog, error: logError } = await supabase
      .from('subscription_error_logs')
      .insert({
        job_id: jobId,
        error_message: error.message,
        stack_trace: error.stack,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (logError) throw logError

    // Update job status
    await supabase
      .from('subscription_sync_jobs')
      .update({
        status: 'failed',
        error_message: error.message,
        processed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    // Send notification if critical
    if (isCriticalError(error)) {
      await sendNotification({
        type: 'subscription_sync_error',
        userId,
        message: 'Critical error in subscription sync',
        data: {
          jobId,
          errorId: errorLog.id,
          errorMessage: error.message
        }
      })
    }

    return errorLog
  } catch (error) {
    console.error('Error handling sync error:', error)
    throw error
  }
}

function isCriticalError(error: Error): boolean {
  const criticalPatterns = [
    'database connection',
    'authentication failed',
    'permission denied',
    'rate limit exceeded'
  ]

  return criticalPatterns.some(pattern =>
    error.message.toLowerCase().includes(pattern)
  )
} 