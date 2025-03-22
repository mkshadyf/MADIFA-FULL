import { createClient } from '@/lib/supabase/client'
import type { SubscriptionPlan, UserSubscription } from '@/types/subscription'

/**
 * PayFast payment service integration
 */
class PayFastService {
  private static instance: PayFastService
  private merchantId: string
  private merchantKey: string
  private passphrase: string
  private returnUrl: string
  private cancelUrl: string
  private notifyUrl: string
  private isProduction: boolean
  private supabase = createClient()

  private constructor() {
    // Initialize with config values
    this.merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || ''
    this.merchantKey = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || ''
    this.passphrase = process.env.NEXT_PUBLIC_PAYFAST_PASSPHRASE || ''
    this.returnUrl = process.env.NEXT_PUBLIC_PAYFAST_RETURN_URL || ''
    this.cancelUrl = process.env.NEXT_PUBLIC_PAYFAST_CANCEL_URL || ''
    this.notifyUrl = process.env.NEXT_PUBLIC_PAYFAST_NOTIFY_URL || ''
    this.isProduction = process.env.NODE_ENV === 'production'

    if (!this.merchantId || !this.merchantKey) {
      console.warn('PayFast credentials not properly configured')
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PayFastService {
    if (!PayFastService.instance) {
      PayFastService.instance = new PayFastService()
    }
    return PayFastService.instance
  }

  /**
   * Create a payment URL for a subscription
   */
  async createSubscriptionPayment(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<string> {
    try {
      // Generate a unique reference for this transaction
      const reference = `sub_${userId}_${Date.now()}`
      
      // Create base payment data
      const paymentData = {
        merchant_id: this.merchantId,
        merchant_key: this.merchantKey,
        return_url: this.returnUrl,
        cancel_url: this.cancelUrl,
        notify_url: this.notifyUrl,
        name_first: 'MADIFA',
        name_last: 'User',
        email_address: userId, // Assuming userId is email for simplicity
        m_payment_id: reference,
        amount: plan.price.toString(),
        item_name: `MADIFA ${plan.name} Subscription`,
        item_description: plan.description,
        subscription_type: 1, // 1 for recurring
        frequency: plan.interval === 'month' ? 3 : 6, // 3 for monthly, 6 for annual
        cycles: 0, // Ongoing subscription
        billing_date: new Date().toISOString().split('T')[0], // Today
        custom_str1: userId,
        custom_str2: plan.id
      }
      
      // Create record in database
      await this.createPendingSubscription(userId, plan, reference)

      // Create the payment URL
      const baseUrl = this.isProduction 
        ? 'https://www.payfast.co.za/eng/process' 
        : 'https://sandbox.payfast.co.za/eng/process'
        
      // Generate query string
      const queryString = Object.entries(paymentData)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
        
      return `${baseUrl}?${queryString}`
    } catch (error) {
      console.error('Error creating PayFast payment:', error)
      throw new Error('Failed to create subscription payment')
    }
  }

  /**
   * Create a pending subscription record
   */
  private async createPendingSubscription(
    userId: string,
    plan: SubscriptionPlan,
    reference: string
  ): Promise<void> {
    try {
      // Calculate subscription dates
      const currentPeriodStart = new Date().toISOString()
      const currentPeriodEnd = new Date()
      
      if (plan.interval === 'month') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)
      }
      
      // Create subscription record
      const { error } = await this.supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          payfast_reference: reference,
          status: 'incomplete',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd.toISOString(),
          cancel_at_period_end: false,
          tier: plan.metadata?.tier || 'premium'
        })
        
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating pending subscription:', error)
      throw error
    }
  }

  /**
   * Process payment notification (ITN) from PayFast
   */
  async processPaymentNotification(
    data: Record<string, string>
  ): Promise<UserSubscription | null> {
    try {
      // Verify the signature and payment data
      if (!this.verifyPayment(data)) {
        throw new Error('Invalid payment notification')
      }
      
      const reference = data.m_payment_id
      const userId = data.custom_str1
      const paymentStatus = data.payment_status
      
      // Look up the pending subscription
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('payfast_reference', reference)
        .eq('user_id', userId)
        .single()
        
      if (error || !subscription) {
        throw new Error('Subscription not found')
      }
      
      // Update the subscription status
      if (paymentStatus === 'COMPLETE') {
        const { data: updatedSubscription, error: updateError } = await this.supabase
          .from('subscriptions')
          .update({
            status: 'active',
            payfast_token: data.token || null
          })
          .eq('id', subscription.id)
          .select('*')
          .single()
          
        if (updateError) {
          throw updateError
        }
        
        return updatedSubscription
      } else {
        // Handle failed payment
        await this.supabase
          .from('subscriptions')
          .update({
            status: 'incomplete_expired'
          })
          .eq('id', subscription.id)
          
        return null
      }
    } catch (error) {
      console.error('Error processing payment notification:', error)
      return null
    }
  }

  /**
   * Verify payment data from PayFast
   */
  private verifyPayment(data: Record<string, string>): boolean {
    // Basic validation - in a real implementation, you would:
    // 1. Check signature using MD5 hash
    // 2. Verify the data with PayFast server
    // 3. Check payment amount and details
    
    // For development, we'll just do basic checks
    return (
      !!data.m_payment_id &&
      !!data.payment_status &&
      data.merchant_id === this.merchantId
    )
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string
  ): Promise<UserSubscription | null> {
    try {
      // Get the subscription
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()
        
      if (error || !subscription) {
        throw new Error('Subscription not found')
      }
      
      // TODO: Call PayFast API to cancel subscription
      // This would be implemented with their API
      
      // Update the local record
      const { data: updatedSubscription, error: updateError } = await this.supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
        .select('*')
        .single()
        
      if (updateError) {
        throw updateError
      }
      
      return updatedSubscription
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return null
    }
  }
}

export const payFastService = PayFastService.getInstance()
