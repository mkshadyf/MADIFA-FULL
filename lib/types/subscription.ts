export type SubscriptionTier = 'free' | 'premium' | 'premium_plus'
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  tier: SubscriptionTier
  billingPeriod: 'monthly' | 'yearly'
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
} 