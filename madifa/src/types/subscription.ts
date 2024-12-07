export type SubscriptionTier = {
  id: string
  name: string
  description: string
  price: number
  interval: 'monthly' | 'yearly'
  features: string[]
  limits?: {
    storage?: number
    bandwidth?: number
    videos?: number
    quality?: string[]
  }
}

export type Subscription = {
  id: string
  user_id: string
  tier_id: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  ended_at?: string
  trial_start?: string
  trial_end?: string
  metadata?: Record<string, any>
}

export type PaymentMethod = {
  id: string
  type: 'card' | 'paypal' | 'bank_transfer'
  details: {
    last4?: string
    brand?: string
    exp_month?: number
    exp_year?: number
    email?: string
    bank_name?: string
  }
  is_default: boolean
}

export type SubscriptionEvent = {
  id: string
  subscription_id: string
  type: 'created' | 'updated' | 'canceled' | 'payment_succeeded' | 'payment_failed'
  data: Record<string, any>
  created_at: string
} 