export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired'

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
} 
