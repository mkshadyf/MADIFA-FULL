import type { SubscriptionService } from '@/lib/services/subscription'
import type { PaymentMethod, Subscription } from '@/types'
import { useCallback } from 'react'
import { useToast } from './useToast'

export function useSubscription(subscriptionService: SubscriptionService) {
  const toast = useToast()

  const createSubscription = useCallback(async (userId: string, planId: string, paymentMethod: PaymentMethod) => {
    try {
      const subscription = await subscriptionService.createSubscription(userId, planId, paymentMethod)
      toast.success('Subscription created successfully')
      return subscription
    } catch (error) {
      toast.error('Failed to create subscription')
      throw error
    }
  }, [subscriptionService, toast])

  const updateSubscription = useCallback(async (userId: string, subscription: Partial<Subscription>) => {
    try {
      const updated = await subscriptionService.updateSubscription(userId, subscription)
      toast.success('Subscription updated successfully')
      return updated
    } catch (error) {
      toast.error('Failed to update subscription')
      throw error
    }
  }, [subscriptionService, toast])

  const cancelSubscription = useCallback(async (userId: string) => {
    try {
      await subscriptionService.cancelSubscription(userId)
      toast.success('Subscription cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel subscription')
      throw error
    }
  }, [subscriptionService, toast])

  return {
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getPlans: subscriptionService.getPlans,
    getCurrentSubscription: subscriptionService.getCurrentSubscription,
    getSubscriptionStatus: subscriptionService.getSubscriptionStatus,
    getUsage: subscriptionService.getUsage,
    getSubscriptionTiers: subscriptionService.getSubscriptionTiers,
    getInvoices: subscriptionService.getInvoices,
    downloadInvoice: subscriptionService.downloadInvoice,
    getPaymentMethods: subscriptionService.getPaymentMethods,
    setDefaultPaymentMethod: subscriptionService.setDefaultPaymentMethod,
    deletePaymentMethod: subscriptionService.deletePaymentMethod,
    checkAccess: subscriptionService.checkAccess
  }
}
