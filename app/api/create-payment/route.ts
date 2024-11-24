import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    const { userId, planId, tier, price, billingPeriod } = await request.json()

    // Get user details
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    // Create Stripe customer if not exists
    const { data: customers } = await stripe.customers.search({
      query: `email:'${profile.email}'`,
    })

    let customerId = customers[0]?.id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          userId
        }
      })
      customerId = customer.id
    }

    // Create subscription price
    const priceData = {
      unit_amount: price * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: billingPeriod === 'monthly' ? 'month' : 'year'
      },
      product_data: {
        name: `Madifa ${tier} Plan`,
        metadata: {
          tier,
          planId
        }
      }
    }

    const price = await stripe.prices.create(priceData)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`,
      metadata: {
        userId,
        planId,
        tier,
        billingPeriod
      }
    })

    // Store session details for verification
    await supabase
      .from('payment_sessions')
      .insert({
        session_id: session.id,
        user_id: userId,
        plan_id: planId,
        tier,
        billing_period: billingPeriod,
        amount: price,
        status: 'pending'
      })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('Payment session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
} 