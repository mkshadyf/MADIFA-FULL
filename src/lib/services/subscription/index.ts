import { subscriptionService } from './subscription-service'
import { payFastService } from './payfast'

// Export subscription service 
export { subscriptionService } from './subscription-service'
export type { SubscriptionService } from './types'

// Export utility functions
export { handleSubscriptionError } from './subscription-error-handler'

// Export vimeo utilities
export { getVimeoAccess, syncVimeoAccess } from './vimeo'

// Export PayFast service
export { payFastService }

// Export individual methods for direct use
export const {
  getSubscription,
  getCurrentSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getBillingHistory,
  checkAccess,
  checkQuotaBeforeDownload,
  startQuotaMonitoring,
  stopQuotaMonitoring,
  checkSchedulerHealth
} = subscriptionService
