import { subscriptionService } from '@/lib/services/subscription'
import type { SubscriptionPlan, UserSubscription } from '@/types/subscription'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (user?.id) {
      void loadSubscription()
    }
  }, [user])

  const loadSubscription = async () => {
    try {
      setIsLoading(true)
      const data = await subscriptionService.getCurrentSubscription(user!.id)
      setSubscription(data)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load subscription')
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getSubscriptionTiers = async (): Promise<SubscriptionPlan[]> => {
    try {
      return await subscriptionService.getSubscriptionTiers()
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load subscription tiers')
      )
      return []
    }
  }

  const createSubscription = async (plan: SubscriptionPlan) => {
    try {
      setIsLoading(true)
      await subscriptionService.createSubscription(user!.id, plan)
      await loadSubscription()
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to create subscription')
      )
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!subscription) return

    try {
      setIsLoading(true)
      await subscriptionService.cancelSubscription(subscription.stripe_subscription_id)
      await loadSubscription()
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to cancel subscription')
      )
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateSubscription = async (updates: Partial<UserSubscription>) => {
    if (!subscription) return

    try {
      setIsLoading(true)
      await subscriptionService.updateSubscription(subscription.stripe_subscription_id, updates)
      await loadSubscription()
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to update subscription')
      )
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    subscription,
    isLoading,
    error,
    getSubscriptionTiers,
    createSubscription,
    cancelSubscription,
    updateSubscription,
    refresh: loadSubscription,
  }
}
