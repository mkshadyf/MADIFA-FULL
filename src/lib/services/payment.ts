import { createClient } from '@/lib/supabase'
import type { PaymentNotification } from '@/types/payment'
import type { BillingPeriod, SubscriptionTier } from '@/types/subscription'
import md5 from 'md5'
import { subscriptionService } from './subscription'

interface CreatePaymentSessionParams {
  userId: string
  planId: string
  tier: SubscriptionTier
  price: number
  billingPeriod: BillingPeriod
}

export class PaymentService {
  private supabase = createClient()

  async handlePaymentNotification(data: PaymentNotification): Promise<void> {
    try {
      // Verify signature
      const isValid = this.validateSignature(data)
      if (!isValid) {
        throw new Error('Invalid payment signature')
      }

      // Extract user and plan IDs from m_payment_id
      const [userId, planId] = data.m_payment_id.split('_')

      if (!userId || !planId) {
        throw new Error('Invalid payment ID format')
      }

      // Update subscription based on payment status
      switch (data.payment_status) {
        case 'COMPLETE':
          await subscriptionService.updateSubscription(userId, {
            status: 'active',
            plan_id: planId,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days
          })
          break
        case 'CANCELLED':
          await subscriptionService.updateSubscription(userId, {
            status: 'canceled',
            cancel_at_period_end: true,
          })
          break
        case 'FAILED':
          // Log failed payment
          await this.logPaymentFailure(userId, data)
          break
      }

      // Log payment notification
      await this.logPaymentNotification(userId, data)
    } catch (error) {
      console.error('Error handling payment notification:', error)
      throw error
    }
  }

  private validateSignature(data: PaymentNotification): boolean {
    const passPhrase = process.env.PAYFAST_PASSPHRASE
    const receivedSignature = data.signature
    const dataForSignature = { ...data }
    delete (dataForSignature as Partial<PaymentNotification>).signature

    const dataString = Object.entries(dataForSignature)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(
        ([key, value]) => `${key}=${encodeURIComponent(String(value).trim())}`
      )
      .join('&')

    const calculatedSignature = md5(dataString + '&passphrase=' + passPhrase)
    return calculatedSignature === receivedSignature
  }

  private async logPaymentNotification(
    userId: string,
    data: PaymentNotification
  ) {
    await this.supabase.from('payment_logs').insert({
      user_id: userId,
      payment_id: data.pf_payment_id,
      status: data.payment_status,
      amount: parseFloat(data.amount_gross),
      data: data,
      created_at: new Date().toISOString(),
    })
  }

  private async logPaymentFailure(userId: string, data: PaymentNotification) {
    await this.supabase.from('payment_failures').insert({
      user_id: userId,
      payment_id: data.pf_payment_id,
      amount: parseFloat(data.amount_gross),
      reason: data.payment_status,
      data: data,
      created_at: new Date().toISOString(),
    })
  }
}

export const paymentService = new PaymentService()

export async function createPaymentSession({
  userId,
  planId,
  tier,
  price,
  billingPeriod,
}: CreatePaymentSessionParams) {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        planId,
        tier,
        price,
        billingPeriod,
      }),
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
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
        payment_method_id: subscriptionData.paymentMethodId,
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
        cancel_at_period_end: true,
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
        effective_date: profile.subscription_period_end,
      })

    if (logError) throw logError

    return true
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    throw error
  }
}
