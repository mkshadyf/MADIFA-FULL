import React from "react"
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import UserActivityChart from '@/components/admin/user-activity-chart'

interface UserMetrics {
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  subscriptionTiers: {
    free: number
    premium: number
    premium_plus: number
  }
  subscriptionStatus: {
    active: number
    inactive: number
    past_due: number
  }
  userRetention: number
  averageSessionDuration: number
}

type _SubscriptionTier = 'free' | 'premium' | 'premium_plus'
type _SubscriptionStatus = 'active' | 'inactive' | 'past_due'

export default function AnalyticsPage(): JSX.Element {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchMetrics = async (): Promise<void> => {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('user_metrics')
          .select('*')
          .single()

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!data) {
          throw new Error('No metrics data found')
        }

        setMetrics(data as UserMetrics)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch metrics'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    void fetchMetrics()
  }, [supabase])

  if (loading) {
    return <LoadingSpinner fullscreen text="Loading analytics..." />
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">User Analytics Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Users" value={metrics.totalUsers} />
        <MetricCard title="Active Users" value={metrics.activeUsers} />
        <MetricCard title="New Users" value={metrics.newUsers} />
        <MetricCard title="Churned Users" value={metrics.churnedUsers} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">User Activity</h2>
        <UserActivityChart />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <SubscriptionMetrics
          title="Subscription Tiers"
          data={metrics.subscriptionTiers}
        />
        <SubscriptionMetrics
          title="Subscription Status"
          data={metrics.subscriptionStatus}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <MetricCard
          title="User Retention"
          value={`${(metrics.userRetention * 100).toFixed(1)}%`}
        />
        <MetricCard
          title="Avg. Session Duration"
          value={`${Math.round(metrics.averageSessionDuration / 60)} mins`}
        />
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
}

function MetricCard({ title, value }: MetricCardProps): JSX.Element {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}

interface SubscriptionMetricsProps {
  title: string
  data: Record<string, number>
}

function SubscriptionMetrics({
  title,
  data,
}: SubscriptionMetricsProps): JSX.Element {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-gray-500">{title}</h3>
      <div className="space-y-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="capitalize">{key.replace('_', ' ')}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
