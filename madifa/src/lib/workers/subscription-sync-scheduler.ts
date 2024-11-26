import { retryFailedSyncJobs } from '@/lib/services/subscription-retry'
import { createClient } from '@/lib/supabase/server'

// Run every 5 minutes
const SYNC_INTERVAL = 5 * 60 * 1000

export async function startSyncScheduler() {
  const supabase = createClient()

  const processJobs = async () => {
    try {
      // Get pending jobs
      const { data: jobs, error } = await supabase
        .from('subscription_sync_jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10)

      if (error) throw error
      if (!jobs?.length) return

      // Process jobs
      await Promise.all(jobs.map(async (job) => {
        try {
          await retryFailedSyncJobs()
        } catch (error) {
          console.error('Error processing sync job:', error)
        }
      }))
    } catch (error) {
      console.error('Error in sync scheduler:', error)
    }
  }

  // Start scheduler
  setInterval(processJobs, SYNC_INTERVAL)
} 
