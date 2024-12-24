import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { subscriptionService } from '@/lib/services/subscription'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'

export default function PaymentMethodManager() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (user) {
      loadPaymentMethods()
    }
  }, [user])

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const methods = await subscriptionService.getPaymentMethods(user!.id)
      setPaymentMethods(methods)
    } catch (error) {
      console.error('Error loading payment methods:', error)
      showToast('Failed to load payment methods', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      await subscriptionService.setDefaultPaymentMethod(user!.id, methodId)
      await loadPaymentMethods()
      showToast('Default payment method updated', 'success')
    } catch (error) {
      console.error('Error setting default payment method:', error)
      showToast('Failed to update default payment method', 'error')
    }
  }

  const handleDelete = async (methodId: string) => {
    try {
      await subscriptionService.deletePaymentMethod(user!.id, methodId)
      await loadPaymentMethods()
      showToast('Payment method removed', 'success')
    } catch (error) {
      console.error('Error deleting payment method:', error)
      showToast(
        error instanceof Error &&
          error.message === 'Cannot delete default payment method'
          ? 'Cannot delete default payment method'
          : 'Failed to remove payment method',
        'error'
      )
    }
  }

  const handleAddNew = async () => {
    // Implementation for adding new payment method
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Payment Methods</h2>
        <Button onClick={handleAddNew}>Add New</Button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className="flex items-center justify-between rounded-lg bg-gray-800 p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <p className="font-medium">
                  {method.type} ending in {method.last_four}
                </p>
                <p className="text-sm text-gray-400">
                  Expires {method.expiry_month}/{method.expiry_year}
                </p>
              </div>
              {method.is_default ? (
                <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400">
                  Default
                </span>
              ) : null}
            </div>

            <div className="flex items-center space-x-2">
              {!method.is_default && (
                <Button
                  variant="secondary"
                  onClick={() => handleSetDefault(method.id)}
                >
                  Set Default
                </Button>
              )}
              <Button variant="ghost" onClick={() => handleDelete(method.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
