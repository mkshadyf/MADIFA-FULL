export type SubscriptionTierType = 'free' | 'basic' | 'premium' | 'premium_plus'

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'

export type PaymentMethodType = 'card' | 'paypal' | 'bank_transfer'

export type BillingPeriod = 'monthly' | 'yearly'

export interface SubscriptionTier {
  id: string
  name: string
  type: SubscriptionTierType
  price: number
  currency: string
  interval: BillingPeriod
  features: string[]
  limits: {
    storage: number
    bandwidth: number
    video_count: number
  }
  created_at: string
  updated_at: string
}

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

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: SubscriptionStatus
  tier: string
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export type UserSubscription = Subscription & {
  user: {
    id: string
    email: string
    full_name: string
  }
  tier: string
  billing_period: string
  price: number
}

export interface BillingHistory {
  id: string
  user_id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  payment_method: PaymentMethodType
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  metadata?: {
    stripePriceId: string
  }
}

export interface Invoice {
  id: string
  subscription_id: string
  amount: number
  currency: string
  status: PaymentStatus
  created_at: string
  paid_at: string | null
  payment_method: PaymentMethod | null
}

export type PaymentStatus = 'paid' | 'unpaid' | 'failed'
