import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import type { PaymentMethod } from '@/types/subscription'
import { useEffect, useState } from 'react'

interface PaymentMethodManagerProps {
  userId: string
  subscriptionService: {
    getPaymentMethods: (userId: string) => Promise<PaymentMethod[]>
    setDefaultPaymentMethod: (userId: string, methodId: string) => Promise<void>
    deletePaymentMethod: (userId: string, methodId: string) => Promise<void>
  }
}

export default function PaymentMethodManager({
  userId,
  subscriptionService,
}: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    if (userId) {
      void loadPaymentMethods()
    }
  }, [userId])

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const methods = await subscriptionService.getPaymentMethods(userId)
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
      await subscriptionService.setDefaultPaymentMethod(userId, methodId)
      await loadPaymentMethods()
      showToast('Default payment method updated', 'success')
    } catch (error) {
      console.error('Error setting default payment method:', error)
      showToast('Failed to update default payment method', 'error')
    }
  }

  const handleDelete = async (methodId: string) => {
    try {
      await subscriptionService.deletePaymentMethod(userId, methodId)
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
            className="flex items-center justify-between border-b p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="font-medium">
                  {method.card?.brand} •••• {method.card?.last4}
                </span>
                <span className="text-sm text-gray-500">
                  Expires {method.card?.exp_month}/{method.card?.exp_year}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {method.isDefault ? (
                <span className="text-sm text-green-600">Default</span>
              ) : (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Set as default
                </button>
              )}
              <button
                onClick={() => handleDelete(method.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
