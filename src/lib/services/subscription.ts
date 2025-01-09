import { subscriptionPlans, type Plan } from '@/lib/config/subscription-plans'
import type {
  PaymentMethod,
  QuotaCheckResult,
  SubscriptionError,
  SubscriptionPlan,
  UserSubscription,
} from '@/types/subscription'
import {
  cancelSubscription,
  getBillingHistory,
  getCurrentSubscription,
  updateSubscription,
} from './subscription/index'
import { handleSubscriptionAccess } from './subscription/subscription-access'
import { handleSubscriptionError } from './subscription/subscription-error-handler'
import { handleRetry } from './subscription/subscription-retry-handler'
import { createSubscription } from './subscription/subscription-service'

function convertPlanToSubscriptionPlan(plan: Plan): SubscriptionPlan {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    currency: 'USD', // Default currency
    interval: plan.interval,
    features: plan.features,
    metadata: {
      ...plan.metadata,
      quota: plan.limits.maxStorage,
      maxDownloads: plan.limits.maxDownloads,
      maxStorage: plan.limits.maxStorage,
    },
  }
}

function createSubscriptionError(
  code: string,
  message: string,
  originalError?: Error,
  details?: Record<string, string>
): SubscriptionError {
  return {
    name: 'SubscriptionError',
    code,
    message,
    originalError,
    details,
  }
}

export const subscriptionService = {
  getCurrentSubscription,
  cancelSubscription,
  getBillingHistory,
  createSubscription,
  updateSubscription,
  handleSubscriptionAccess,
  handleRetry,
  handleSubscriptionError,

  async getSubscriptionTiers(): Promise<SubscriptionPlan[]> {
    // Convert the subscription plans to SubscriptionPlan type
    return Object.values(subscriptionPlans).map(plan =>
      convertPlanToSubscriptionPlan(plan as Plan)
    )
  },

  async syncSubscriptionAccess(subscription: UserSubscription): Promise<void> {
    const plan = convertPlanToSubscriptionPlan(
      subscription.plan as unknown as Plan
    )
    await handleSubscriptionAccess(
      subscription.user_id,
      plan,
      subscription.status === 'active' ? 'grant' : 'revoke'
    )
  },

  async reactivateSubscription(
    subscriptionId: string
  ): Promise<UserSubscription> {
    try {
      const subscription = await updateSubscription(subscriptionId, {
        status: 'active',
        cancel_at_period_end: false,
      })

      if (!subscription) {
        throw createSubscriptionError(
          'SUBSCRIPTION_NOT_FOUND',
          'Subscription not found'
        )
      }

      return subscription
    } catch (error) {
      throw createSubscriptionError(
        'REACTIVATION_FAILED',
        'Failed to reactivate subscription',
        error as Error
      )
    }
  },

  async checkAccess(
    userId: string,
    _contentId: string
  ): Promise<QuotaCheckResult> {
    try {
      const subscription = await getCurrentSubscription(userId)
      if (!subscription) {
        return {
          canProceed: false,
          currentUsage: 0,
          quota: 0,
          remaining: 0,
          message: 'No active subscription found',
          allowed: false,
          error: 'No active subscription found',
        }
      }

      // Check if subscription is active
      if (subscription.status !== 'active') {
        return {
          canProceed: false,
          currentUsage: 0,
          quota: 0,
          remaining: 0,
          message: 'Subscription is not active',
          allowed: false,
          error: 'Subscription is not active',
        }
      }

      // Get current usage and quota
      const usage = subscription.usage || {
        downloads: 0,
        storage: 0,
        streams: 0,
      }
      const quota = subscription.plan?.metadata?.quota || 0

      return {
        canProceed: true,
        currentUsage: usage.storage,
        quota,
        remaining: Math.max(0, quota - usage.storage),
        message: 'Access granted',
        allowed: true,
        error: undefined,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return {
        canProceed: false,
        currentUsage: 0,
        quota: 0,
        remaining: 0,
        message,
        allowed: false,
        error: message,
      }
    }
  },

  // Payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    // Implementation of getPaymentMethods
    return []
  },

  async setDefaultPaymentMethod(): Promise<void> {
    // Implementation of setDefaultPaymentMethod
  },

  async deletePaymentMethod(): Promise<void> {
    // Implementation of deletePaymentMethod
  },

  // Invoice methods
  async getInvoices(): Promise<any[]> {
    // Implementation of getInvoices
    return []
  },

  async downloadInvoice(): Promise<Blob> {
    // Implementation of downloadInvoice
    return new Blob()
  },

  // Quota monitoring methods
  async checkQuotaBeforeDownload(): Promise<QuotaCheckResult> {
    return {
      canProceed: true,
      currentUsage: 0,
      quota: 0,
      remaining: 0,
      message: 'Access granted',
      allowed: true,
      error: undefined,
    }
  },

  async startQuotaMonitoring(): Promise<void> {
    // Implementation of startQuotaMonitoring
  },

  async stopQuotaMonitoring(): Promise<void> {
    // Implementation of stopQuotaMonitoring
  },

  async updateUsage(): Promise<void> {
    // Implementation of updateUsage
  },

  async getActiveSubscription(): Promise<UserSubscription | null> {
    // Implementation of getActiveSubscription
    return null
  },
}
