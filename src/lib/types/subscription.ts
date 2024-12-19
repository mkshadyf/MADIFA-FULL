export type SubscriptionTierType = 'free' | 'basic' | 'premium' | 'premium_plus'

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'past_due'
  | 'incomplete'
  | 'trialing'
  | 'inactive'

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
  type: PaymentMethodType
  last4?: string
  exp_month?: number
  exp_year?: number
  brand?: string
  email?: string // For PayPal
  bank_name?: string // For bank transfers
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  tier_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at?: string
  trial_end?: string
  payment_id?: string
  payment_method?: PaymentMethod
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export type UserSubscription = Subscription & {
  user: {
    id: string
    email: string
    full_name: string
  }
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
  currency: string
  interval: BillingPeriod
  features: string[]
  tier: SubscriptionTierType
  metadata?: Record<string, unknown>
}
