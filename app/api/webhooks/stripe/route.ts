import { createServerClient } from '@/lib/supabase/client'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const supabase = createServerClient()
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    switch (event.type) {
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user ID from customer ID
        const { data: customer } = await stripe.customers.retrieve(customerId)
        const userId = customer.metadata.userId

        // Update subscription status
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: subscription.status === 'active' ? 'active' : 'past_due',
            subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('user_id', userId)

        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        const deletedCustomerId = deletedSubscription.customer as string

        // Get user ID from customer ID
        const { data: deletedCustomer } = await stripe.customers.retrieve(deletedCustomerId)
        const deletedUserId = deletedCustomer.metadata.userId

        // Update subscription status
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'inactive',
            subscription_tier: 'free'
          })
          .eq('user_id', deletedUserId)

        break

      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice
        const failedCustomerId = invoice.customer as string

        // Get user ID from customer ID
        const { data: failedCustomer } = await stripe.customers.retrieve(failedCustomerId)
        const failedUserId = failedCustomer.metadata.userId

        // Update subscription status
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'past_due'
          })
          .eq('user_id', failedUserId)

        break

      case 'invoice.paid':
        const paidInvoice = event.data.object as Stripe.Invoice
        const paidCustomerId = paidInvoice.customer as string

        // Get user ID from customer ID
        const { data: paidCustomer } = await stripe.customers.retrieve(paidCustomerId)
        const paidUserId = paidCustomer.metadata.userId

        // Add to billing history
        await supabase
          .from('billing_history')
          .insert({
            user_id: paidUserId,
            amount: paidInvoice.amount_paid,
            status: 'succeeded',
            payment_method: paidInvoice.payment_intent_types?.[0] || 'card',
            billing_reason: 'subscription_renewal',
            created_at: new Date().toISOString()
          })

        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
} 