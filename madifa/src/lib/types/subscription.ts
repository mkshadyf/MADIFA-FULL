export type BillingPeriod = 'monthly' | 'yearly'

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'incomplete'

export interface SubscriptionTier {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  created_at: string
  updated_at: string
}

export interface Subscription {
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  billingPeriod: BillingPeriod
  paymentMethodId?: string
} 
