import { createClient } from '@/lib/supabase/server'

interface SubscriptionSync {
  user_id: string
  subscription_id: string
  status: string
  synced_at: string
}

export async function syncSubscriptions(subscriptions: SubscriptionSync[]) {
  const supabase = createClient()

  try {
    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await supabase
            .from('subscription_syncs')
            .insert({
              user_id: subscription.user_id,
              subscription_id: subscription.subscription_id,
              status: 'completed',
              synced_at: new Date().toISOString()
            })
        } catch (error) {
          await supabase
            .from('subscription_syncs')
            .insert({
              user_id: subscription.user_id,
              subscription_id: subscription.subscription_id,
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
              synced_at: new Date().toISOString()
            })
        }
      })
    )
  } catch (error) {
    console.error('Error syncing subscriptions:', error)
    throw error
  }
} 