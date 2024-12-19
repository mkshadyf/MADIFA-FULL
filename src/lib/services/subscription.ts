import { createAPIError } from '@/lib/error'
import { supabase } from '@/lib/supabase/client'
import type {
  PaymentMethod,
  Subscription,
  SubscriptionStatus,
  SubscriptionTier,
} from '@/lib/types/subscription'

export interface SubscriptionUsage {
  storage_used: number
  bandwidth_used: number
  video_count: number
}

export class SubscriptionService {
  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_tier(*)')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to get subscription',
        'GET_SUBSCRIPTION_ERROR',
        error
      )
    }
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('price')

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to get subscription tiers',
        'GET_TIERS_ERROR',
        error
      )
    }
  }

  async createSubscription(
    userId: string,
    tierId: string,
    paymentMethod: PaymentMethod
  ): Promise<Subscription> {
    try {
      const paymentIntent = await this.createPaymentIntent(
        tierId,
        paymentMethod
      )

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          tier_id: tierId,
          payment_id: paymentIntent.id,
          status: 'active' as SubscriptionStatus,
          current_period_start: new Date().toISOString(),
          current_period_end: this.calculatePeriodEnd(new Date()).toISOString(),
          cancel_at_period_end: false,
          payment_method: paymentMethod,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to create subscription',
        'CREATE_SUBSCRIPTION_ERROR',
        error
      )
    }
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to update subscription',
        'UPDATE_SUBSCRIPTION_ERROR',
        error
      )
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelImmediately: boolean = false
  ): Promise<void> {
    try {
      const updates = cancelImmediately
        ? {
            status: 'cancelled' as SubscriptionStatus,
            cancelled_at: new Date().toISOString(),
          }
        : {
            cancel_at_period_end: true,
          }

      const { error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to cancel subscription',
        'CANCEL_SUBSCRIPTION_ERROR',
        error
      )
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          status: 'active' as SubscriptionStatus,
        })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to reactivate subscription',
        'REACTIVATE_SUBSCRIPTION_ERROR',
        error
      )
    }
  }

  async getSubscriptionUsage(
    subscriptionId: string
  ): Promise<SubscriptionUsage> {
    try {
      const { data, error } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to get subscription usage',
        'GET_USAGE_ERROR',
        error
      )
    }
  }

  async updatePaymentMethod(
    subscriptionId: string,
    paymentMethod: PaymentMethod
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ payment_method: paymentMethod })
        .eq('id', subscriptionId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to update payment method',
        'UPDATE_PAYMENT_ERROR',
        error
      )
    }
  }

  private async createPaymentIntent(
    tierId: string,
    paymentMethod: PaymentMethod
  ): Promise<{ id: string }> {
    // TODO: Implement Stripe payment intent creation
    return { id: `mock_payment_intent_${Date.now()}` }
  }

  private calculatePeriodEnd(startDate: Date): Date {
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
    return endDate
  }
}

export const subscriptionService = new SubscriptionService()
