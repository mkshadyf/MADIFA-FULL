import { createAPIError, createErrorContext } from '@/lib/utils/error-handler'
import type { Invoice, PaymentMethod, Subscription, SubscriptionPlan } from '@/types'
import type { Content } from '@/types/content'

export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'

export interface SubscriptionUsage {
  storage_used: number
  bandwidth_used: number
  video_count: number
}

export interface SubscriptionService {
  createSubscription: (userId: string, planId: string, paymentMethod: PaymentMethod) => Promise<Subscription>
  updateSubscription: (userId: string, subscription: Partial<Subscription>) => Promise<Subscription>
  cancelSubscription: (userId: string) => Promise<void>
  reactivateSubscription: (userId: string) => Promise<void>
  getSubscription: (userId: string) => Promise<Subscription | null>
  getSubscriptionTier: (userId: string) => Promise<string | null>
  getSubscriptionStatus: (userId: string) => Promise<SubscriptionStatus>
  checkAccess: (userId: string, contentId: string) => Promise<{ canProceed: boolean; message?: string; currentUsage: number; quota: number; remaining: number }>
  checkQuotaBeforeDownload: (content: Content) => Promise<{ canProceed: boolean; message?: string }>
  startQuotaMonitoring: () => void
  stopQuotaMonitoring: () => void
  subscribe: (userId: string, planId: string, paymentMethod: PaymentMethod) => Promise<Subscription>
  getPlans: () => Promise<SubscriptionPlan[]>
  getCurrentSubscription: (userId: string) => Promise<Subscription | null>
  getSubscriptionTiers: () => Promise<SubscriptionPlan[]>
  getInvoices: (userId: string) => Promise<Invoice[]>
  downloadInvoice: (invoiceId: string) => Promise<Blob>
  getPaymentMethods: (userId: string) => Promise<PaymentMethod[]>
  setDefaultPaymentMethod: (userId: string, paymentMethodId: string) => Promise<void>
  deletePaymentMethod: (userId: string, paymentMethodId: string) => Promise<void>
  getUsage: (userId: string) => Promise<SubscriptionUsage>
  updateUsage: (size: number) => Promise<void>
}

export class SubscriptionServiceImpl implements SubscriptionService {
  constructor() {
    this.getSubscription = this.getCurrentSubscription
    this.getSubscriptionTier = async (userId) => {
      const subscription = await this.getCurrentSubscription(userId)
      return subscription?.tier || null
    }
    this.checkQuotaBeforeDownload = async (content) => {
      // Implementation
      return { canProceed: true }
    }
    this.startQuotaMonitoring = () => {
      // Implementation
    }
    this.stopQuotaMonitoring = () => {
      // Implementation
    }
    this.subscribe = this.createSubscription
  }

  getSubscription: (userId: string) => Promise<Subscription | null>
  getSubscriptionTier: (userId: string) => Promise<string | null>
  checkQuotaBeforeDownload: (content: Content) => Promise<{ canProceed: boolean; message?: string }>
  startQuotaMonitoring: () => void
  stopQuotaMonitoring: () => void
  subscribe: (userId: string, planId: string, paymentMethod: PaymentMethod) => Promise<Subscription>

  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get subscription plans',
        'GET_PLANS_ERROR',
        createErrorContext('subscription', 'getPlans')
      )
    }
  }

  async getCurrentSubscription(userId: string): Promise<Subscription | null> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get current subscription',
        'GET_SUBSCRIPTION_ERROR',
        createErrorContext('subscription', 'getCurrentSubscription', { userId })
      )
    }
  }

  async getSubscriptionTiers(): Promise<SubscriptionPlan[]> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get subscription tiers',
        'GET_SUBSCRIPTION_TIERS_ERROR',
        createErrorContext('subscription', 'getSubscriptionTiers')
      )
    }
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get invoices',
        'GET_INVOICES_ERROR',
        createErrorContext('subscription', 'getInvoices', { userId })
      )
    }
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to download invoice',
        'DOWNLOAD_INVOICE_ERROR',
        createErrorContext('subscription', 'downloadInvoice', { invoiceId })
      )
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get payment methods',
        'GET_PAYMENT_METHODS_ERROR',
        createErrorContext('subscription', 'getPaymentMethods', { userId })
      )
    }
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to set default payment method',
        'SET_DEFAULT_PAYMENT_METHOD_ERROR',
        createErrorContext('subscription', 'setDefaultPaymentMethod', { userId, paymentMethodId })
      )
    }
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    try {
      // Check if payment method exists and belongs to user
      const paymentMethods = await this.getPaymentMethods(userId)
      const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId)

      if (!paymentMethod) {
        throw new Error('Payment method not found')
      }

      // Check if payment method is default using PaymentMethod type
      const isDefault = paymentMethod.type === 'card' && paymentMethod.card
      if (isDefault) {
        throw new Error('Cannot delete default payment method')
      }

      // Implementation to delete payment method
      throw new Error('Not implemented')
    } catch (error) {
      if (error instanceof Error && error.message === 'Cannot delete default payment method') {
        throw error
      }
      throw createAPIError(
        'Failed to delete payment method',
        'DELETE_PAYMENT_METHOD_ERROR',
        createErrorContext('subscription', 'deletePaymentMethod', { userId, paymentMethodId })
      )
    }
  }

  async getUsage(userId: string): Promise<SubscriptionUsage> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get subscription usage',
        'GET_USAGE_ERROR',
        createErrorContext('subscription', 'getUsage', { userId })
      )
    }
  }

  async createSubscription(userId: string, planId: string, paymentMethod: PaymentMethod): Promise<Subscription> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to create subscription',
        'CREATE_SUBSCRIPTION_ERROR',
        createErrorContext('subscription', 'createSubscription', { userId, planId })
      )
    }
  }

  async updateSubscription(userId: string, subscription: Partial<Subscription>): Promise<Subscription> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to update subscription',
        'UPDATE_SUBSCRIPTION_ERROR',
        createErrorContext('subscription', 'updateSubscription', { userId, subscription })
      )
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to cancel subscription',
        'CANCEL_SUBSCRIPTION_ERROR',
        createErrorContext('subscription', 'cancelSubscription', { userId })
      )
    }
  }

  async reactivateSubscription(userId: string): Promise<void> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to reactivate subscription',
        'REACTIVATE_SUBSCRIPTION_ERROR',
        createErrorContext('subscription', 'reactivateSubscription', { userId })
      )
    }
  }

  async getSubscriptionStatus(userId: string): Promise<Subscription['status']> {
    try {
      // Implementation
      throw new Error('Not implemented')
    } catch (error) {
      throw createAPIError(
        'Failed to get subscription status',
        'GET_STATUS_ERROR',
        createErrorContext('subscription', 'getSubscriptionStatus', { userId })
      )
    }
  }

  async checkAccess(userId: string, contentId: string): Promise<{ canProceed: boolean; message?: string; currentUsage: number; quota: number; remaining: number }> {
    try {
      // Mock implementation for demonstration
      const currentUsage = 50; // Example value
      const quota = 100; // Example value
      const remaining = quota - currentUsage;
      return {
        canProceed: remaining > 0,
        currentUsage,
        quota,
        remaining,
      }
    } catch (error) {
      throw createAPIError(
        'Failed to check access',
        'CHECK_ACCESS_ERROR',
        createErrorContext('subscription', 'checkAccess', { userId, contentId })
      )
    }
  }

  async updateUsage(size: number): Promise<void> {
    try {
      // Implementation for updating usage
      console.log(`Usage updated by ${size} units.`)
    } catch (error) {
      throw createAPIError(
        'Failed to update usage',
        'UPDATE_USAGE_ERROR',
        createErrorContext('subscription', 'updateUsage', { size })
      )
    }
  }
}

export const subscriptionService = new SubscriptionServiceImpl()

// Export individual functions for convenience
export const {
  getPlans,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionStatus,
  getUsage,
  getCurrentSubscription,
  getSubscriptionTiers,
  getInvoices,
  downloadInvoice,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  checkAccess,
  updateUsage
} = subscriptionService
