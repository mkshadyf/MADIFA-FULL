import { createServerClient } from '@/lib/supabase/client'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(req: Request) {
  try {
    const { planId, price, userId, email } = await req.json()
    const supabase = createServerClient()

    // Verify user exists and has permission
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Generate unique payment ID
    const paymentId = crypto.randomUUID()

    // Create PayFast payment data
    const data = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: `${SITE_URL}/subscription/success`,
      cancel_url: `${SITE_URL}/subscription/cancel`,
      notify_url: `${SITE_URL}/api/payment-webhook`,
      name_first: user.full_name.split(' ')[0],
      name_last: user.full_name.split(' ').slice(1).join(' '),
      email_address: email,
      m_payment_id: paymentId,
      amount: price,
      item_name: `Madifa ${planId} Subscription`,
      subscription_type: 1, // Monthly subscription
    }

    // Generate signature
    const signature = generateSignature(data, PAYFAST_MERCHANT_KEY!)

    // Store payment intent in database
    const { error: paymentError } = await supabase
      .from('payment_intents')
      .insert({
        id: paymentId,
        user_id: userId,
        plan_id: planId,
        amount: price,
        status: 'pending',
      })

    if (paymentError) {
      throw paymentError
    }

    // Return PayFast checkout URL
    return NextResponse.json({
      paymentUrl: `https://sandbox.payfast.co.za/eng/process?${new URLSearchParams({
        ...data,
        signature,
      })}`,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { message: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}

function generateSignature(data: Record<string, any>, merchantKey: string): string {
  const signatureString = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, value]) => value)
    .join('')

  return crypto
    .createHash('md5')
    .update(signatureString + merchantKey)
    .digest('hex')
} 