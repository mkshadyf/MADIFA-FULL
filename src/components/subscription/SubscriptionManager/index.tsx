import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { subscriptionService } from '@/lib/services/subscription'
import type { SubscriptionError, SubscriptionPlan } from '@/types/subscription'

import InvoiceViewer from './InvoiceViewer'
import PaymentMethodManager from './PaymentMethodManager'
import Plans from './Plans'

export function SubscriptionManager() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [error, setError] = useState<SubscriptionError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setIsLoading(true)
      await subscriptionService.cancelSubscription(subscriptionId)
      showToast('Subscription cancelled successfully', 'success')
    } catch (err) {
      const error = err as Error
      setError({
        name: 'SubscriptionError',
        code: 'CANCEL_FAILED',
        message: 'Failed to cancel subscription',
        originalError: error,
      })
      showToast('Failed to cancel subscription', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      setIsLoading(true)
      const subscription = await subscriptionService.getCurrentSubscription(user!.id)
      if (!subscription) {
        throw new Error('Subscription not found')
      }
      await subscriptionService.updateSubscription(subscriptionId, {
        status: 'active',
      })
      showToast('Subscription reactivated successfully', 'success')
    } catch (err) {
      const error = err as Error
      setError({
        name: 'SubscriptionError',
        code: 'REACTIVATION_FAILED',
        message: 'Failed to reactivate subscription',
        originalError: error,
      })
      showToast('Failed to reactivate subscription', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Please sign in to manage your subscription</div>
  }

  return (
    <div className="space-y-8">
      <Plans
        onSubscribe={async (plan: SubscriptionPlan) => {
          try {
            setIsLoading(true)
            await subscriptionService.createSubscription(user.id, plan)
            showToast('Subscription created successfully', 'success')
          } catch (err) {
            const error = err as Error
            setError({
              name: 'SubscriptionError',
              code: 'SUBSCRIPTION_FAILED',
              message: 'Failed to create subscription',
              originalError: error,
            })
            showToast('Failed to create subscription', 'error')
          } finally {
            setIsLoading(false)
          }
        }}
        onCancel={handleCancelSubscription}
        onReactivate={handleReactivateSubscription}
        isLoading={isLoading}
      />

      <PaymentMethodManager
        userId={user.id}
        subscriptionService={subscriptionService}
      />

      <InvoiceViewer
        userId={user.id}
        subscriptionService={subscriptionService}
      />

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error.message}
              </h3>
              {error.details && (
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc space-y-1 pl-5">
                    {Object.entries(error.details).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
