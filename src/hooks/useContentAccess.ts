import { useEffect, useState } from 'react'

import { subscriptionService } from '@/lib/services/subscription'

import { useAuth } from './useAuth'

export function useContentAccess(contentId: string) {
  const { user } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setHasAccess(false)
      setIsLoading(false)
      return
    }

    const checkAccess = async () => {
      try {
        setIsLoading(true)
        const access = await subscriptionService.checkAccess(user.id, contentId)
        setHasAccess(access.canProceed)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check access')
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [user, contentId])

  return { hasAccess, isLoading, error }
}
