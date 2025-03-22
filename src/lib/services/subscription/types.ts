import type {
  Invoice,
  PaymentMethod,
  QuotaCheckResult,
  SubscriptionPlan,
  SyncError,
  SyncJob,
  UserSubscription
} from '@/types/subscription'

export interface SubscriptionService {
  // Subscription management
  createSubscription(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<{ redirectUrl: string }>
  cancelSubscription(subscriptionId: string): Promise<UserSubscription | null>
  getSubscription(userId: string): Promise<UserSubscription | null>
  getCurrentSubscription(userId: string): Promise<UserSubscription | null>
  updateSubscription(
    subscriptionId: string,
    updates: Partial<UserSubscription>
  ): Promise<UserSubscription | null>
  getBillingHistory(userId: string): Promise<any[]>

  // Payment methods
  getPaymentMethods(userId: string): Promise<PaymentMethod[]>
  setDefaultPaymentMethod(userId: string, methodId: string): Promise<void>
  deletePaymentMethod(userId: string, methodId: string): Promise<void>

  // Invoices
  getInvoices(userId: string): Promise<Invoice[]>
  downloadInvoice(invoiceId: string): Promise<Blob>

  // Quota management
  checkAccess(userId: string, contentId: string): Promise<QuotaCheckResult>
  checkQuotaBeforeDownload(
    userId: string,
    contentSize: number
  ): Promise<QuotaCheckResult>
  startQuotaMonitoring(userId: string): Promise<void>
  stopQuotaMonitoring(userId: string): Promise<void>
  updateUsage(userId: string, usage: number): Promise<void>

  // Sync management
  syncSubscriptions(): Promise<void>
  getSyncErrors(): Promise<SyncError[]>
  getSyncJobs(): Promise<SyncJob[]>
  getSubscriptionTiers(): Promise<SubscriptionPlan[]>

  // Health check
  checkSchedulerHealth(): Promise<boolean>
}
