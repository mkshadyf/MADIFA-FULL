import { useAuth } from '@/hooks/useAuth'
import { subscriptionService } from '@/lib/services/subscription'
import type { PaymentMethod } from '@/types/subscription'
import { useCallback, useEffect, useState } from 'react'

export function usePaymentMethods() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadPaymentMethods = useCallback(async () => {
    if (!user) {
      setPaymentMethods([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const methods = await subscriptionService.getPaymentMethods()
      setPaymentMethods(methods)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load payment methods')
      )
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadPaymentMethods()
  }, [loadPaymentMethods])

  const setDefaultPaymentMethod = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in to set default payment method')
    }

    try {
      setLoading(true)
      await subscriptionService.setDefaultPaymentMethod()
      await loadPaymentMethods()
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error('Failed to set default payment method')
    } finally {
      setLoading(false)
    }
  }, [user, loadPaymentMethods])

  const deletePaymentMethod = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in to delete payment method')
    }

    try {
      setLoading(true)
      await subscriptionService.deletePaymentMethod()
      await loadPaymentMethods()
    } catch (err) {
      throw err instanceof Error
        ? err
        : new Error('Failed to delete payment method')
    } finally {
      setLoading(false)
    }
  }, [user, loadPaymentMethods])

  return {
    paymentMethods,
    loading,
    error,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    refresh: loadPaymentMethods,
  }
}
