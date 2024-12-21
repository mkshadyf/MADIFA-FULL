import type { PostgrestError } from '@supabase/supabase-js'


import { createClient } from '@/lib/supabase/client'

interface SubscriptionData {
  id: string
  userId: string
  status: 'active' | 'inactive' | 'past_due'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

export async function syncSubscriptions(): Promise<void> {
  const supabase = createClient()

  try {
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')

    if (error) {
      throw error
    }

    if (!subscriptions) {
      console.warn('No active subscriptions found')
      return
    }

    const now = new Date()
    const updates: SubscriptionData[] = []

    for (const subscription of subscriptions) {
      const periodEnd = new Date(subscription.current_period_end)

      if (periodEnd < now && !subscription.cancel_at_period_end) {
        updates.push({
          id: subscription.id,
          userId: subscription.user_id,
          status: 'past_due',
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
      }
    }

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .upsert(updates)

      if (updateError) {
        throw updateError
      }

      console.info(`Updated ${updates.length} subscriptions`)
    }
  } catch (err) {
    const error = err as Error | PostgrestError
    const errorMessage =
      'message' in error
        ? error.message
        : 'Unknown error during subscription sync'
    console.error(errorMessage)
    throw error
  }
}

// Start the subscription sync worker
export function startSubscriptionSyncWorker(): void {
  // Run every hour
  const SYNC_INTERVAL = 60 * 60 * 1000

  // Initial sync
  void syncSubscriptions()

  // Schedule recurring sync
  setInterval(() => {
    void syncSubscriptions()
  }, SYNC_INTERVAL)
}
