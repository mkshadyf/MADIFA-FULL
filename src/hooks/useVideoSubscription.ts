import { subscriptionService } from '@/lib/services/subscription'
import { useAuth } from '@/providers/AuthProvider'
import { useEffect, useState } from 'react'

interface UseVideoSubscriptionResult {
  hasAccess: boolean
  isLoading: boolean
  error: Error | null
}

export function useVideoSubscription(requiresSubscription = true): UseVideoSubscriptionResult {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkSubscription = async () => {
      if (!requiresSubscription || !user) {
        setHasAccess(!requiresSubscription)
        setIsLoading(false)
        return
      }

      try {
        const subscription = await subscriptionService.getCurrentSubscription(user.id)
        setHasAccess(subscription?.status === 'active')
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to check subscription'))
      } finally {
        setIsLoading(false)
      }
    }

    void checkSubscription()
  }, [user, requiresSubscription])

  return {
    hasAccess,
    isLoading,
    error,
  }
} 