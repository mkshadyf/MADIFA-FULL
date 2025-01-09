import type {
  SubscriptionInterval,
  SubscriptionTier,
  SubscriptionTierType,
} from '@/types/subscription'

export const subscriptionPlans = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Pass',
    description: 'Perfect for monthly subscribers',
    price: 39.99,
    features: [
      'Access to all current videos',
      'HD quality streaming',
      'Watch on any device',
      'No ads',
    ],
    limitations: {
      maxQuality: '1080p',
      devices: ['mobile', 'web', 'tv'],
    },
    interval: 'month' as SubscriptionInterval,
    tier: 'premium' as SubscriptionTier,
    type: 'individual' as SubscriptionTierType,
    limits: {
      maxDownloads: 100,
      maxStorage: 50,
      maxStreams: 2,
    },
    metadata: {
      recommended: true,
    },
    billing_period: 'monthly',
    monthly_price: 39.99,
    yearly_price: null,
  },
  yearly: {
    id: 'yearly',
    name: 'Annual Pass',
    description: 'Best value for annual subscribers',
    price: 299.99,
    features: [
      'Everything in Monthly',
      'Save 27% vs monthly',
      'Early access to new content',
      'Offline viewing',
    ],
    limitations: {
      maxQuality: '4k',
      devices: ['mobile', 'web', 'tv'],
    },
    interval: 'year' as SubscriptionInterval,
    tier: 'premium_plus' as SubscriptionTier,
    type: 'individual' as SubscriptionTierType,
    limits: {
      maxDownloads: 1000,
      maxStorage: 100,
      maxStreams: 4,
    },
    metadata: {
      recommended: true,
      bestValue: true,
    },
    billing_period: 'yearly',
    monthly_price: null,
    yearly_price: 299.99,
  },
}

// Types for subscription plans
export type PlanId = keyof typeof subscriptionPlans
export type Plan = (typeof subscriptionPlans)[PlanId]
