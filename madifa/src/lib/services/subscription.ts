import { env } from '@/config/env'
import { createClient } from '@/lib/supabase/client'
import type { SubscriptionDetails, SubscriptionPlan } from '@/types/subscription'
import Stripe from 'stripe'

const stripe = new Stripe(env.VITE_STRIPE_SECRET_KEY!)

class SubscriptionService {
  private supabase = createClient()

  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .order('price')

    if (error) throw error
    return data
  }

  async getCurrentSubscription(userId: string): Promise<SubscriptionDetails | null> {
    const { data, error } = await this.supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async createSubscription(userId: string, planId: string) {
    // Get user's customer ID or create one
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId }
      })
      customerId = customer.id

      await this.supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    // Get plan details
    const { data: plan } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (!plan) throw new Error('Plan not found')

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripe_price_id }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    })

    // Save subscription details
    await this.supabase.from('subscriptions').insert({
      user_id: userId,
      plan_id: planId,
      status: subscription.status,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })

    return {
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as any).payment_intent?.client_secret
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.getCurrentSubscription(userId)
    if (!subscription) throw new Error('No active subscription')

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    })

    await this.supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', userId)
  }

  async reactivateSubscription(userId: string): Promise<void> {
    const subscription = await this.getCurrentSubscription(userId)
    if (!subscription) throw new Error('No subscription to reactivate')

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    })

    await this.supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: false })
      .eq('user_id', userId)
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await this.updateSubscriptionStatus(subscription)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await this.updateSubscriptionStatus(await stripe.subscriptions.retrieve(invoice.subscription as string))
        }
        break
      }
    }
  }

  private async updateSubscriptionStatus(subscription: Stripe.Subscription): Promise<void> {
    await this.supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  async checkAccess(userId: string, contentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .rpc('check_subscription_access', {
        user_id: userId,
        content_id: contentId
      })

    if (error) throw error
    return data || false
  }
}

export const subscriptionService = new SubscriptionService() 
