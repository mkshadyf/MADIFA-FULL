import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import { subscriptionService } from '@/lib/services/subscription'
import { createClient } from '@/lib/supabase/client'
import type { UserSubscription } from '@/types/subscription'

export default function ManageSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        setSubscription(data)
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setError('Failed to load subscription details')
      } finally {
        setLoading(false)
      }
    }

    void fetchSubscription()
  }, [user])

  const handleCancelSubscription = async () => {
    if (!subscription) return

    setActionLoading(true)
    setError(null)
    setMessage(null)

    try {
      await subscriptionService.cancelSubscription(subscription.id)
      setSubscription(  prev =>
        prev

      )
      setMessage('Subscription cancelled successfully')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      setError('Failed to cancel subscription')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscription) return

    setActionLoading(true)
    setError(null)
    setMessage(null)

    try {
      await subscriptionService.reactivateSubscription(subscription.id)
      setSubscription(prev =>
        prev
          ? {
              ...prev,
              status: 'active',
              cancel_at_period_end: false,
            }
          : null
      )
      setMessage('Subscription reactivated successfully')
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      setError('Failed to reactivate subscription')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-white">
          Manage Subscription
        </h1>

        {subscription ? (
          <div className="space-y-6 rounded-lg bg-gray-800 p-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-white">
                Current Plan
              </h2>
              <div className="grid grid-cols-2 gap-4 text-gray-300">
                <div>
                  <p className="text-sm font-medium">Plan</p>
                  <p className="text-lg">{subscription.tier}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-lg">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Current Period End</p>
                  <p className="text-lg">
                    {new Date(
                      subscription.billing_period
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Auto Renew</p>
                  <p className="text-lg">
                    {subscription.end_date ? 'No' : 'Yes'}
                  </p>
                </div>
              </div>
            </div>

            {error ? <div className="text-sm text-red-500">{error}</div> : null}

            {message ? (
              <div className="text-sm text-green-500">{message}</div>
            ) : null}

            <div>
              {subscription.status === 'active' &&
              !subscription.end_date ? (
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="w-full rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              ) : subscription.status === 'inactive' ||
                subscription.end_date ? (
                <button
                  type="button"
                  onClick={handleReactivateSubscription}
                  disabled={actionLoading}
                  className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Reactivate Subscription'}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            No active subscription found.
            <div className="mt-4">
              <a
                href="/subscription"
                className="text-indigo-500 hover:text-indigo-400"
              >
                View subscription plans
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
