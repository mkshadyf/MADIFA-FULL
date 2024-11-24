import { subscriptionPlans } from '@/lib/config/subscription-plans'
import { handleSubscriptionAccess } from '@/lib/services/subscription-access'
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
        const { customer, status, items } = subscription

        if (status === 'active') {
          // Get user from customer ID
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('stripe_customer_id', customer)
            .single()

          if (!profile) break

          // Get plan from price ID
          const priceId = items.data[0].price.id
          const plan = Object.values(subscriptionPlans).find(
            p => process.env[`STRIPE_${p.id.toUpperCase()}_PRICE_ID`] === priceId
          )

          if (!plan) break

          // Grant access to content
          await handleSubscriptionAccess(profile.user_id, plan, 'grant')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { customer } = subscription

        // Get user from customer ID
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('stripe_customer_id', customer)
          .single()

        if (!profile) break

        // Get plan from price ID
        const priceId = subscription.items.data[0].price.id
        const plan = Object.values(subscriptionPlans).find(
          p => process.env[`STRIPE_${p.id.toUpperCase()}_PRICE_ID`] === priceId
        )

        if (!plan) break

        // Revoke access to content
        await handleSubscriptionAccess(profile.user_id, plan, 'revoke')
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