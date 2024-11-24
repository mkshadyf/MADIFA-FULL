import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    const supabase = createClient()

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const { customer, status, items, current_period_start, current_period_end } = subscription

        // Get user from customer ID
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('stripe_customer_id', customer)
          .single()

        if (!profile) break

        // Update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: profile.user_id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: items.data[0].price.id,
            status,
            current_period_start: new Date(current_period_start * 1000).toISOString(),
            current_period_end: new Date(current_period_end * 1000).toISOString()
          })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        break
      }
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