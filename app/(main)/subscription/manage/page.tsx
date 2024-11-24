'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { cancelSubscription, reactivateSubscription } from '@/lib/services/subscription'
import type { UserSubscription } from '@/lib/types/subscription'

export default function ManageSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
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

    fetchSubscription()
  }, [user])

  const handleCancelSubscription = async () => {
    if (!subscription) return

    setActionLoading(true)
    setError(null)
    setMessage(null)

    try {
      await cancelSubscription(subscription.id)
      setSubscription(prev => prev ? {
        ...prev,
        status: 'inactive',
        cancel_at_period_end: true
      } : null)
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
      await reactivateSubscription(subscription.id)
      setSubscription(prev => prev ? {
        ...prev,
        status: 'active',
        cancel_at_period_end: false
      } : null)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Manage Subscription</h1>

        {subscription ? (
          <div className="bg-gray-800 rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Current Plan</h2>
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
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Auto Renew</p>
                  <p className="text-lg">
                    {subscription.cancel_at_period_end ? 'No' : 'Yes'}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {message && (
              <div className="text-green-500 text-sm">{message}</div>
            )}

            <div>
              {subscription.status === 'active' && !subscription.cancel_at_period_end ? (
                <button
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
              ) : subscription.status === 'inactive' || subscription.cancel_at_period_end ? (
                <button
                  onClick={handleReactivateSubscription}
                  disabled={actionLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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