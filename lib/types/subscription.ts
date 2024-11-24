export type SubscriptionTier = 'free' | 'premium' | 'premium_plus'
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'cancelled'
export type BillingPeriod = 'monthly' | 'yearly'

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  description: string
  features: string[]
  price: {
    monthly: number
    yearly: number
  }
  maxProfiles: number
  maxDevices: number
  videoQuality: '480p' | '720p' | '1080p'
  downloadEnabled: boolean
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  billing_period: BillingPeriod
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  payment_method_id?: string
  price: number
  created_at: string
  updated_at: string
}

export interface BillingHistory {
  id: string
  subscription_id: string
  amount: number
  status: 'succeeded' | 'failed' | 'pending'
  payment_method: string
  billing_reason: string
  created_at: string
} 