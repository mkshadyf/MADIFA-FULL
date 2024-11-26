import { createClient } from '@/lib/supabase/server'
import type { Subscription, SubscriptionPlan } from '@/types/subscription'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function createSubscription(
  userId: string,
  plan: SubscriptionPlan
): Promise<{ clientSecret: string }> {
  const supabase = createClient()

  try {
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const { data: { user } } = await supabase.auth.getUser()
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId }
      })
      customerId = customer.id

      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    })

    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent

    return { clientSecret: paymentIntent.client_secret! }
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    await stripe.subscriptions.cancel(subscriptionId)
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
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
    console.error('Error getting subscription:', error)
    throw error
  }
} 
