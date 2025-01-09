import { subscriptionService } from '@/lib/services/subscription/subscription'
import { syncVimeoAccess } from '@/lib/services/subscription/vimeo'
import type { UserSubscription } from '@/types/subscription'

export async function syncSubscriptionAccess(
  subscription: UserSubscription
): Promise<void> {
  try {
    // Sync with Vimeo
    await syncVimeoAccess(subscription)

    // Update subscription status in database
    await subscriptionService.updateSubscription(subscription.id, {
      status: subscription.status,
      tier: subscription.tier,
    })
  } catch (error) {
    console.error('Error syncing subscription access:', error)
    throw error
  }
}

export async function syncAllSubscriptions(): Promise<void> {
  try {
    // Get all active subscriptions
    const response = await fetch('/api/subscriptions?status=active')
    if (!response.ok) {
      throw new Error('Failed to fetch active subscriptions')
    }

    const subscriptions: UserSubscription[] = await response.json()

    // Sync each subscription
    await Promise.all(
      subscriptions.map(subscription => syncSubscriptionAccess(subscription))
    )
  } catch (error) {
    console.error('Error syncing all subscriptions:', error)
    throw error
  }
}

export async function scheduleSubscriptionSync(
  subscription: UserSubscription,
  date: Date
): Promise<void> {
  try {
    await fetch('/api/subscription-sync/schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscription.id,
        syncDate: date.toISOString(),
      }),
    })
  } catch (error) {
    console.error('Error scheduling subscription sync:', error)
    throw error
  }
}
