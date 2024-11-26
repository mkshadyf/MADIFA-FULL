import { createClient } from '@/lib/supabase/client'
import type { BillingPeriod, SubscriptionTier } from '@/lib/types/subscription'

interface CreatePaymentSessionParams {
  userId: string
  planId: string
  tier: SubscriptionTier
  price: number
  billingPeriod: BillingPeriod
}

export async function createPaymentSession({
  userId,
  planId,
  tier,
  price,
  billingPeriod
}: CreatePaymentSessionParams) {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        planId,
        tier,
        price,
        billingPeriod
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create payment session')
    }

    const { sessionId, url } = await response.json()
    return { sessionId, url }
  } catch (error) {
    console.error('Payment session creation error:', error)
    throw error
  }
}

export async function verifyPayment(sessionId: string) {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    })

    if (!response.ok) {
      throw new Error('Failed to verify payment')
    }

    return response.json()
  } catch (error) {
    console.error('Payment verification error:', error)
    throw error
  }
}

export async function updateSubscriptionStatus(
  userId: string,
  status: 'active' | 'past_due' | 'cancelled',
  subscriptionData: {
    tier: SubscriptionTier
    billingPeriod: BillingPeriod
    currentPeriodEnd: string
    paymentMethodId?: string
  }
) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: subscriptionData.tier,
        subscription_status: status,
        subscription_period_end: subscriptionData.currentPeriodEnd,
        payment_method_id: subscriptionData.paymentMethodId
      })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Subscription status update error:', error)
    throw error
  }
}

export async function cancelSubscription(userId: string) {
  const supabase = createClient()

  try {
    // First, get the current subscription data
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_period_end')
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    // Update the subscription status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'cancelled',
        cancel_at_period_end: true
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    // Add cancellation record
    const { error: logError } = await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'cancellation',
        previous_tier: profile.subscription_tier,
        effective_date: profile.subscription_period_end
      })

    if (logError) throw logError

    return true
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    throw error
  }
} 
