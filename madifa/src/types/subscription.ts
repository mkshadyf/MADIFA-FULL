export type SubscriptionTier = 'free' | 'basic' | 'premium'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete'

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal'
  last4?: string
  brand?: string
  expMonth?: number
  expYear?: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: number
  interval: 'month' | 'year'
  features: string[]
  maxQuality: '720p' | '1080p' | '4k'
  downloadEnabled: boolean
  adFree: boolean
  stripePriceId: string
}

export interface SubscriptionDetails {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  stripeSubscriptionId: string
  stripeCustomerId: string
} 