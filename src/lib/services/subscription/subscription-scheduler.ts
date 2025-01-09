import { createClient } from '@/lib/supabase/server'

export async function scheduleSubscriptionSync(
  userId: string,
  subscriptionId: string,
  priority: number = 1
): Promise<void> {
  try {
    const supabase = await createClient()

    // Create a new sync job
    const { error } = await supabase.from('subscription_sync_jobs').insert({
      user_id: userId,
      subscription_id: subscriptionId,
      status: 'pending',
      priority,
      retry_count: 0,
      created_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error('Error scheduling subscription sync:', error)
    throw error
  }
}
