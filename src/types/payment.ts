export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  bank_account?: {
    bank_name: string
    last4: string
  }
  billing_details: {
    name: string
    email: string
    address: {
      line1: string
      line2?: string
      city: string
      state: string
      postal_code: string
      country: string
    }
  }
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  client_secret: string
  payment_method: string | null
  created_at: string
  updated_at: string
}

export interface PaymentError {
  type: string
  code: string
  message: string
  decline_code?: string
  param?: string
}

export type PaymentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed'

export interface PaymentResult {
  success: boolean
  error?: PaymentError
  payment_intent?: PaymentIntent
}

export interface PaymentNotification {
  id: string
  type: 'payment.success' | 'payment.failed' | 'subscription.created' | 'subscription.updated' | 'subscription.cancelled'
  data: {
    customer_id: string
    payment_id?: string
    subscription_id?: string
    amount?: number
    currency?: string
    status: 'succeeded' | 'failed' | 'pending'
    error?: {
      code: string
      message: string
    }
  }
  created_at: string
}
