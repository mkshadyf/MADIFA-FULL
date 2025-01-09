import { SubscriptionService } from './subscription-service'

export const subscriptionService = new SubscriptionService()

// Export the service class for type checking
export { SubscriptionService }

// Export individual functions
export const {
  getSubscription,
  getCurrentSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getBillingHistory,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getInvoices,
  downloadInvoice,
  checkAccess,
  checkQuotaBeforeDownload,
  startQuotaMonitoring,
  stopQuotaMonitoring,
  updateUsage,
  getSubscriptionTiers,
  syncSubscriptions,
  getSyncErrors,
  getSyncJobs
} = subscriptionService
