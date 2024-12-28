import React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'

import {
  cancelSubscription,
  getBillingHistory,
  getCurrentSubscription,
} from '@/lib/services/subscription-management'
import type { BillingHistory, UserSubscription } from '@/types/subscription'

export default function SubscriptionManager() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  )
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user) return

      try {
        const [subscriptionData, billingData] = await Promise.all([
          getCurrentSubscription(user.id),
          getBillingHistory(user.id),
        ])

        setSubscription(subscriptionData ? {
          id: subscriptionData.id,
          user_id: user.id,
          plan_id: subscriptionData.prices[0]?.id || '',
          status: subscriptionData.status as 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid',
          tier: subscriptionData.prices[0]?.product || 'free',
          start_date: new Date(subscriptionData.created * 1000).toISOString(),
          end_date: subscriptionData.current_period_end 
            ? new Date(subscriptionData.current_period_end * 1000).toISOString()
            : new Date().toISOString(),
          created_at: new Date(subscriptionData.created * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: user.id,
            email: user.email || '',
            full_name: user.full_name || ''
          },
          billing_period: subscriptionData.prices[0]?.recurring?.interval || 'month',
          price: (subscriptionData.prices[0]?.unit_amount || 0) / 100 // Convert cents to dollars
        } : null)

        setBillingHistory(billingData.map(invoice => ({
          id: invoice.id,
          user_id: user.id,
          subscription_id: invoice.subscription || '',
          amount: invoice.amount_due / 100, // Convert cents to dollars
          currency: invoice.currency,
          status: invoice.status === 'paid' ? 'succeeded' : 'failed',
          payment_method: 'card' as const,
          created_at: new Date(invoice.created * 1000).toISOString()
        })))
      } catch (error) {
        console.error('Error loading subscription data:', error)
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to load subscription data'
        )
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptionData()
  }, [user])

  const handleCancelSubscription = async () => {
    if (!subscription) return

    setCancelling(true)
    setError(null)

    try {
      await cancelSubscription(subscription.id)
      setSubscription(prev =>
        prev
          ? {
              ...prev,
              status: 'canceled',
              cancel_at_period_end: true,
            }
          : null
      )
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to cancel subscription'
      )
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-32 rounded-lg bg-gray-800"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-800"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Current Subscription
        </h2>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-white">
                  {subscription.tier} Plan
                </p>
                <p className="text-sm text-gray-400">
                  {subscription.billing_period === 'monthly'
                    ? 'Monthly'
                    : 'Annual'}{' '}
                  billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-white">
                  ${subscription.price.toFixed(2)}/
                  {subscription.billing_period === 'monthly' ? 'mo' : 'yr'}
                </p>
                <p className="text-sm text-gray-400">
                  Next billing date:{' '}
                  {new Date(
                    subscription.end_date
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p
                  className={`text-sm font-medium ${
                    subscription.status === 'active'
                      ? 'text-green-500'
                      : subscription.status === 'past_due'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </p>
              </div>
              {subscription.status === 'active' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No active subscription</p>
        )}
      </div>

      {/* Billing History */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Billing History
        </h2>
        {billingHistory.length > 0 ? (
          <div className="space-y-4">
            {billingHistory.map(bill => (
              <div
                key={bill.id}
                className="flex items-center justify-between border-b border-gray-700 py-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    ${bill.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(bill.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{bill.payment_method}</p>
                  <p
                    className={`text-xs ${
                      bill.status === 'succeeded'
                        ? 'text-green-500'
                        : bill.status === 'pending'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    }`}
                  >
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No billing history available</p>
        )}
      </div>

      {error ? (
        <div className="text-center text-sm text-red-500">{error}</div>
      ) : null}
    </div>
  )
}
