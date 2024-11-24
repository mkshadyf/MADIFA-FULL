import { createServerClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(request: Request) {
  const supabase = createServerClient()

  try {
    const { sessionId } = await request.json()

    // Get session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    })

    if (!session) {
      throw new Error('Session not found')
    }

    // Get the payment session from our database
    const { data: paymentSession } = await supabase
      .from('payment_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (!paymentSession) {
      throw new Error('Payment session not found')
    }

    // Update subscription status based on payment status
    if (session.payment_status === 'paid') {
      const subscription = session.subscription as Stripe.Subscription

      // Update user subscription
      const { error: subscriptionError } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: paymentSession.tier,
          subscription_status: 'active',
          subscription_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          payment_method_id: session.payment_method as string
        })
        .eq('user_id', paymentSession.user_id)

      if (subscriptionError) throw subscriptionError

      // Update payment session status
      const { error: sessionError } = await supabase
        .from('payment_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)

      if (sessionError) throw sessionError

      // Add to billing history
      const { error: billingError } = await supabase
        .from('billing_history')
        .insert({
          user_id: paymentSession.user_id,
          subscription_id: subscription.id,
          amount: session.amount_total! / 100, // Convert from cents
          status: 'succeeded',
          payment_method: session.payment_method_types[0],
          billing_reason: 'subscription_create',
          created_at: new Date().toISOString()
        })

      if (billingError) throw billingError

      return NextResponse.json({
        success: true,
        status: 'completed',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end
        }
      })
    } else {
      // Payment failed or pending
      const { error: updateError } = await supabase
        .from('payment_sessions')
        .update({
          status: 'failed',
          error_message: 'Payment verification failed'
        })
        .eq('session_id', sessionId)

      if (updateError) throw updateError

      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Payment verification failed'
      })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
} 