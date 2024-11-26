export const subscriptionPlans = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Pass',
    price: 39.99,
    features: [
      'Access to all current videos',
      'HD quality streaming',
      'Watch on any device',
      'No ads'
    ],
    limitations: {
      maxQuality: '1080p',
      devices: ['mobile', 'web', 'tv']
    }
  },
  yearly: {
    id: 'yearly',
    name: 'Annual Pass',
    price: 299.99,
    features: [
      'Everything in Monthly',
      'Save 27% vs monthly',
      'Early access to new content',
      'Offline viewing'
    ],
    limitations: {
      maxQuality: '4k',
      devices: ['mobile', 'web', 'tv']
    }
  }
}

// Types for subscription plans
export type PlanId = keyof typeof subscriptionPlans
export type Plan = typeof subscriptionPlans[PlanId] 
