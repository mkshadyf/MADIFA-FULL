import { stripe } from '@/lib/services/stripe'
import { supabase } from '@/lib/supabase/client'
import {
  type BillingHistory,
  type Subscription,
  type SubscriptionTierType,
} from '@/lib/types/subscription'

// Helper functions
async function notifyPaymentFailure(
  userId: string,
  failureCount: number
): Promise<void> {
  // Implementation for payment failure notification
  console.log(`Payment failed for user ${userId}. Attempt ${failureCount}`)
}

function calculateProratedAmount(
  currentTier: any,
  newPlanId: string,
  endDate: Date
): number {
  // Implementation for proration calculation
  return 0 // Placeholder
}

async function createProratedCharge(
  userId: string,
  amount: number
): Promise<any> {
  // Implementation for creating prorated charge
  return null // Placeholder
}

export async function getCurrentSubscription(
  userId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, subscription_tier(*)')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function createSubscription(
  userId: string,
  planId: string,
  paymentMethodId: string
): Promise<Subscription> {
  const customer = await stripe.customers.create({
    payment_method: paymentMethodId,
    email: userId, // Assuming userId is the email
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: planId }],
    payment_settings: {
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  })

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customer.id,
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('id', subscriptionId)
    .single()

  if (fetchError) throw fetchError

  await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)

  if (updateError) throw updateError
}

export async function reactivateSubscription(
  subscriptionId: string
): Promise<void> {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('id', subscriptionId)
    .single()

  if (fetchError) throw fetchError

  await stripe.subscriptions.resume(subscription.stripe_subscription_id)

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      cancelled_at: null,
    })
    .eq('id', subscriptionId)

  if (updateError) throw updateError
}

export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPlanId: string
): Promise<void> {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('id', subscriptionId)
    .single()

  if (fetchError) throw fetchError

  await stripe.subscriptions.modify(subscription.stripe_subscription_id, {
    items: [{ price: newPlanId }],
    proration_behavior: 'always_invoice',
  })
}

export async function getBillingHistory(
  userId: string
): Promise<BillingHistory[]> {
  const { data, error } = await supabase
    .from('billing_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export function hasAccessToContent(
  userTier: SubscriptionTierType,
  contentTier: SubscriptionTierType
): boolean {
  const tierLevels: Record<SubscriptionTierType, number> = {
    free: 0,
    basic: 1,
    premium: 2,
    premium_plus: 3,
  }

  return tierLevels[userTier] >= tierLevels[contentTier]
}

export async function handleFailedPayment(userId: string): Promise<void> {
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (fetchError) throw fetchError

  const failureCount = subscription.payment_failure_count || 0

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: failureCount >= 3 ? 'cancelled' : 'past_due',
      payment_failure_count: failureCount + 1,
    })
    .eq('user_id', userId)

  if (updateError) throw updateError

  // Send notification to user
  await notifyPaymentFailure(userId, failureCount + 1)
}

export async function changePlan(
  userId: string,
  newPlanId: string,
  currentSub: Subscription | null
): Promise<void> {
  if (currentSub) {
    // Calculate prorated amount
    const proratedAmount = calculateProratedAmount(
      currentSub.tier,
      newPlanId,
      new Date(currentSub.current_period_end)
    )

    // Create prorated charge
    const charge = await createProratedCharge(userId, proratedAmount)

    // Update subscription
    await updateSubscriptionPlan(currentSub.id, newPlanId)
  } else {
    // Create new subscription
    await createSubscription(userId, newPlanId, '')
  }
}
