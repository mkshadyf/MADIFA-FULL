import type { PlanId } from '@/lib/config/subscription-plans'
import { createClient } from '@/lib/supabase/client'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

interface SubscriptionResponse {
  subscriptionId: string
  clientSecret?: string
}

export async function createSubscription(userId: string, planId: PlanId): Promise<SubscriptionResponse> {
  const supabase = createClient()

  try {
    // Get user's email
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    // Create Stripe customer if doesn't exist
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: {
          supabase_user_id: userId
        }
      })
      customerId = customer.id

      // Save Stripe customer ID
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`]! }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret || undefined
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.cancel(subscriptionId)
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function getSubscriptionStatus(userId: string) {
  const supabase = createClient()

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!profile?.stripe_customer_id) return null

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      expand: ['data.plan']
    })

    return subscriptions.data[0] || null
  } catch (error) {
    console.error('Error getting subscription status:', error)
    throw error
  }
} 
