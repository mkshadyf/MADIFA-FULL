import { createClient } from '@/lib/supabase/client'
import type {
  BillingPeriod,
  SubscriptionPlan,
  SubscriptionTier,
  UserSubscription
} from '@/lib/types/subscription'

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    description: 'Basic access with ads',
    features: [
      'Access to selected content',
      'SD quality (480p)',
      'Ad-supported viewing',
      'Single device streaming'
    ],
    price: {
      monthly: 0,
      yearly: 0
    },
    maxProfiles: 1,
    maxDevices: 1,
    videoQuality: '480p',
    downloadEnabled: false
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    description: 'HD streaming without ads',
    features: [
      'Full content library access',
      'HD quality (1080p)',
      'Ad-free viewing',
      'Download for offline viewing',
      'Stream on 2 devices'
    ],
    price: {
      monthly: 99,
      yearly: 990
    },
    maxProfiles: 2,
    maxDevices: 2,
    videoQuality: '1080p',
    downloadEnabled: true
  },
  {
    id: 'premium_plus',
    name: 'Premium+',
    tier: 'premium_plus',
    description: 'Ultimate family entertainment',
    features: [
      'Everything in Premium',
      'Stream on 4 devices',
      'Up to 4 profiles',
      'Priority support'
    ],
    price: {
      monthly: 149,
      yearly: 1490
    },
    maxProfiles: 4,
    maxDevices: 4,
    videoQuality: '1080p',
    downloadEnabled: true
  }
]

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return SUBSCRIPTION_PLANS
}

export async function getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
}

export async function upgradePlan(
  userId: string,
  planId: string,
  billingPeriod: BillingPeriod
): Promise<{ success: boolean; error?: string; checkoutUrl?: string }> {
  const supabase = createClient()
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)

  if (!plan) {
    return { success: false, error: 'Invalid plan selected' }
  }

  try {
    // Create payment session
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        planId,
        tier: plan.tier,
        price: billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly,
        billingPeriod
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create payment session')
    }

    const { checkoutUrl } = await response.json()

    return {
      success: true,
      checkoutUrl
    }
  } catch (error) {
    console.error('Plan upgrade error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upgrade plan'
    }
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancel_at_period_end: true
      })
      .eq('id', subscriptionId)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return false
  }
}

export async function getBillingHistory(userId: string): Promise<BillingHistory[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching billing history:', error)
    return []
  }
}

export function checkContentAccess(
  contentTier: SubscriptionTier,
  userTier: SubscriptionTier
): boolean {
  const tiers: Record<SubscriptionTier, number> = {
    'free': 0,
    'premium': 1,
    'premium_plus': 2
  }

  return tiers[userTier] >= tiers[contentTier]
}

export async function handleSubscriptionRenewal(
  subscriptionId: string,
  userId: string,
  success: boolean,
  error?: string
) {
  const supabase = createClient()

  try {
    if (success) {
      await supabase
        .from('user_profiles')
        .update({
          subscription_status: 'active',
          last_payment_date: new Date().toISOString(),
          payment_failure_count: 0
        })
        .eq('user_id', userId)
    } else {
      // Handle failed renewal
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('payment_failure_count')
        .eq('user_id', userId)
        .single()

      const failureCount = (profile?.payment_failure_count || 0) + 1

      await supabase
        .from('user_profiles')
        .update({
          subscription_status: failureCount >= 3 ? 'inactive' : 'past_due',
          payment_failure_count: failureCount,
          payment_failure_reason: error
        })
        .eq('user_id', userId)

      // Send notification to user
      await notifyPaymentFailure(userId, failureCount)
    }
  } catch (error) {
    console.error('Error handling subscription renewal:', error)
    throw error
  }
}

export async function upgradeSubscription(
  userId: string,
  newTier: SubscriptionTier,
  billingPeriod: BillingPeriod
) {
  const supabase = createClient()

  try {
    // Get current subscription
    const { data: currentSub } = await supabase
      .from('user_profiles')
      .select('subscription_tier, subscription_period_end')
      .eq('user_id', userId)
      .single()

    // Calculate prorated amount
    const proratedAmount = calculateProratedAmount(
      currentSub.subscription_tier,
      newTier,
      new Date(currentSub.subscription_period_end)
    )

    // Create prorated charge
    const charge = await createProratedCharge(userId, proratedAmount)

    if (charge.status === 'succeeded') {
      // Update subscription
      await supabase
        .from('user_profiles')
        .update({
          subscription_tier: newTier,
          billing_period: billingPeriod,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    }

    return { success: true }
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    throw error
  }
} 