import { createClient } from '@/lib/supabase/server'
import type { QuotaCheckResult } from '@/types/quota'
import type { Invoice, PaymentMethod } from '@/types/subscription'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function getPaymentMethods(
  userId: string
): Promise<PaymentMethod[]> {
  const supabaseClient = await createClient()

  try {
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return []
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripe_customer_id,
      type: 'card',
    })

    return paymentMethods.data.map(method => ({
      id: method.id,
      type: method.type,
      card: method.card,
      isDefault: method.metadata?.isDefault === 'true',
    }))
  } catch (error) {
    console.error('Error getting payment methods:', error)
    throw error
  }
}

export async function setDefaultPaymentMethod(
  userId: string,
  methodId: string
): Promise<void> {
  const supabaseClient = await createClient()

  try {
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      throw new Error('No Stripe customer found')
    }

    await stripe.customers.update(profile.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: methodId,
      },
    })
  } catch (error) {
    console.error('Error setting default payment method:', error)
    throw error
  }
}

export async function deletePaymentMethod(
  userId: string,
  methodId: string
): Promise<void> {
  const supabaseClient = await createClient()

  try {
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      throw new Error('No Stripe customer found')
    }

    await stripe.paymentMethods.detach(methodId)
  } catch (error) {
    console.error('Error deleting payment method:', error)
    throw error
  }
}

export async function getInvoices(userId: string): Promise<Invoice[]> {
  const supabaseClient = await createClient()

  try {
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return []
    }

    const invoices = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
    })

    return invoices.data.map(invoice => ({
      id: invoice.id,
      subscription_id: invoice.subscription as string,
      user_id: userId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status as
        | 'draft'
        | 'open'
        | 'paid'
        | 'void'
        | 'uncollectible',
      created: new Date(invoice.created * 1000).toISOString(),
      due_date: new Date(invoice.due_date! * 1000).toISOString(),
      paid_at:
        invoice.status === 'paid'
          ? new Date(invoice.status_transitions.paid_at! * 1000).toISOString()
          : undefined,
      invoice_pdf: invoice.hosted_invoice_url || undefined,
      receipt_pdf: invoice.hosted_invoice_url || undefined,
      receipt_url: invoice.hosted_invoice_url || undefined,
      lines: invoice.lines.data.map(line => ({
        description: line.description || '',
        amount: line.amount,
        period: {
          start: new Date(line.period.start * 1000).toISOString(),
          end: new Date(line.period.end * 1000).toISOString(),
        },
      })),
    }))
  } catch (error) {
    console.error('Error getting invoices:', error)
    throw error
  }
}

export async function downloadInvoice(invoiceId: string): Promise<Blob> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId)
    if (!invoice.invoice_pdf) {
      throw new Error('No PDF available for this invoice')
    }

    const response = await fetch(invoice.invoice_pdf)
    if (!response.ok) {
      throw new Error('Failed to download invoice PDF')
    }

    return response.blob()
  } catch (error) {
    console.error('Error downloading invoice:', error)
    throw error
  }
}

export async function checkQuotaBeforeDownload(
  userId: string,
  contentSize: number
): Promise<QuotaCheckResult> {
  const supabaseClient = await createClient()

  try {
    const { data: quota } = await supabaseClient
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!quota) {
      throw new Error('No quota found for user')
    }

    const newUsage = quota.current_usage + contentSize
    const canProceed = newUsage <= quota.limit

    return {
      allowed: canProceed,
      canProceed,
      currentUsage: quota.current_usage,
      quota: quota.limit,
      remaining: quota.limit - quota.current_usage,
      error: canProceed ? undefined : 'Quota exceeded',
    }
  } catch (error) {
    console.error('Error checking quota:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      allowed: false,
      canProceed: false,
      currentUsage: 0,
      quota: 0,
      remaining: 0,
      error: message,
    }
  }
}

export async function startQuotaMonitoring(userId: string): Promise<void> {
  const supabaseClient = await createClient()

  try {
    await supabaseClient.from('user_quotas').upsert({
      user_id: userId,
      monitoring_active: true,
      last_checked: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error starting quota monitoring:', error)
    throw error
  }
}

export async function stopQuotaMonitoring(userId: string): Promise<void> {
  const supabaseClient = await createClient()

  try {
    await supabaseClient
      .from('user_quotas')
      .update({ monitoring_active: false })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error stopping quota monitoring:', error)
    throw error
  }
}

export async function updateUsage(
  userId: string,
  usage: number
): Promise<void> {
  const supabaseClient = await createClient()

  try {
    await supabaseClient
      .from('user_quotas')
      .update({ current_usage: usage })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error updating usage:', error)
    throw error
  }
}
