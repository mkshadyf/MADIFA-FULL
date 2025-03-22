import type {
  Invoice,
  PaymentMethod,
  QuotaCheckResult,
  SubscriptionPlan,
  UserSubscription,
} from '@/types/subscription'
import { handleSubscriptionError } from './subscription-error-handler'
import {
  checkQuotaBeforeDownload as checkQuotaBeforeDownloadImpl,
  deletePaymentMethod as deletePaymentMethodImpl,
  downloadInvoice as downloadInvoiceImpl,
  getInvoices as getInvoicesImpl,
  getPaymentMethods as getPaymentMethodsImpl,
  setDefaultPaymentMethod as setDefaultPaymentMethodImpl,
  startQuotaMonitoring as startQuotaMonitoringImpl,
  stopQuotaMonitoring as stopQuotaMonitoringImpl,
  updateUsage as updateUsageImpl,
} from './subscription-payment'
import { syncVimeoAccess } from './vimeo'

class SubscriptionService {
  private static instance: SubscriptionService

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService()
    }
    return SubscriptionService.instance
  }

  public async createSubscription(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<UserSubscription> {
    try {
      // Create subscription in your backend
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, plan }),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      const subscription = await response.json()

      // Sync access with Vimeo
      await syncVimeoAccess(subscription)

      return subscription
    } catch (error) {
      throw handleSubscriptionError(error)
    }
  }

  public async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      throw handleSubscriptionError(error)
    }
  }

  public async updateSubscription(
    subscriptionId: string,
    updates: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update subscription')
      }

      const subscription = await response.json()

      // Sync access with Vimeo if status or tier changed
      if (updates.status || updates.tier) {
        await syncVimeoAccess(subscription)
      }

      return subscription
    } catch (error) {
      throw handleSubscriptionError(error)
    }
  }

  public async getSubscription(
    subscriptionId: string
  ): Promise<UserSubscription> {
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`)

      if (!response.ok) {
        throw new Error('Failed to get subscription')
      }

      return response.json()
    } catch (error) {
      throw handleSubscriptionError(error)
    }
  }

  public async getUserSubscription(
    userId: string
  ): Promise<UserSubscription | null> {
    try {
      const response = await fetch(`/api/users/${userId}/subscription`)

      if (!response.ok) {
        throw new Error('Failed to get user subscription')
      }

      return response.json()
    } catch (error) {
      throw handleSubscriptionError(error)
    }
  }

  public async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    return getPaymentMethodsImpl(userId)
  }

  public async setDefaultPaymentMethod(
    userId: string,
    methodId: string
  ): Promise<void> {
    return setDefaultPaymentMethodImpl(userId, methodId)
  }

  public async deletePaymentMethod(
    userId: string,
    methodId: string
  ): Promise<void> {
    return deletePaymentMethodImpl(userId, methodId)
  }

  public async getInvoices(userId: string): Promise<Invoice[]> {
    return getInvoicesImpl(userId)
  }

  public async downloadInvoice(invoiceId: string): Promise<Blob> {
    return downloadInvoiceImpl(invoiceId)
  }

  public async checkQuotaBeforeDownload(
    userId: string,
    contentSize: number
  ): Promise<QuotaCheckResult> {
    return checkQuotaBeforeDownloadImpl(userId, contentSize)
  }

  public async startQuotaMonitoring(userId: string): Promise<void> {
    return startQuotaMonitoringImpl(userId)
  }

  public async stopQuotaMonitoring(userId: string): Promise<void> {
    return stopQuotaMonitoringImpl(userId)
  }

  public async updateUsage(userId: string, usage: number): Promise<void> {
    return updateUsageImpl(userId, usage)
  }

  public async getActiveSubscription(
    userId: string
  ): Promise<UserSubscription | null> {
    try {
      const response = await fetch(`/api/users/${userId}/subscription/active`)
      if (!response.ok) {
        throw new Error('Failed to get active subscription')
      }
      return response.json()
    } catch (error) {
      throw handleSubscriptionError(error)
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance()

export async function getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
  return subscriptionService.getActiveSubscription(userId);
}
