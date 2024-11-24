import { createClient } from '@/lib/supabase/client'
import type { SubscriptionStatus, SubscriptionTier } from '@/lib/types/subscription'

interface CreateSubscriptionParams {
  userId: string
  planId: string
  tier: SubscriptionTier
  price: number
  billingPeriod: 'monthly' | 'yearly'
}

interface UpdateSubscriptionParams {
  subscriptionId: string
  status: SubscriptionStatus
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

export async function createSubscription({
  userId,
  planId,
  tier,
  price,
  billingPeriod
}: CreateSubscriptionParams) {
  const supabase = createClient()

  try {
    // Create subscription record
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        tier,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          new Date().setMonth(
            new Date().getMonth() + (billingPeriod === 'yearly' ? 12 : 1)
          )
        ).toISOString(),
        price,
        billing_period: billingPeriod
      })
      .select()
      .single()

    if (error) throw error

    // Update user profile with subscription info
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active'
      })
      .eq('user_id', userId)

    if (profileError) throw profileError

    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export async function updateSubscription({
  subscriptionId,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd
}: UpdateSubscriptionParams) {
  const supabase = createClient()

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        status,
        ...(currentPeriodEnd && { current_period_end: currentPeriodEnd }),
        ...(typeof cancelAtPeriodEnd !== 'undefined' && { cancel_at_period_end: cancelAtPeriodEnd })
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error

    // Update user profile status
    if (subscription) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          subscription_status: status
        })
        .eq('user_id', subscription.user_id)

      if (profileError) throw profileError
    }

    return subscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  return updateSubscription({
    subscriptionId,
    status: 'inactive',
    cancelAtPeriodEnd: true
  })
}

export async function reactivateSubscription(subscriptionId: string) {
  return updateSubscription({
    subscriptionId,
    status: 'active',
    cancelAtPeriodEnd: false
  })
} 