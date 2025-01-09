import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  getRevenueByTier,
  getSubscriptionAnalytics,
  getSubscriptionTrends,
} from '@/lib/services/subscription-analytics'
import type {
  RevenueTier,
  SubscriptionAnalytics,
  SubscriptionTrend,
} from '@/types/analytics'
import { useEffect, useState } from 'react'

export function SubscriptionAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null)
  const [trends, setTrends] = useState<SubscriptionTrend[]>([])
  const [revenue, setRevenue] = useState<RevenueTier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, trendsData, revenueData] = await Promise.all([
          getSubscriptionAnalytics(),
          getSubscriptionTrends(),
          getRevenueByTier(),
        ])

        setAnalytics(analyticsData)
        setTrends(trendsData)
        setRevenue(revenueData)
      } catch (err) {
        console.error('Failed to fetch subscription analytics:', err)
        setError('Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500">
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Total Subscribers</h3>
          <p className="text-3xl font-bold">
            {analytics.metrics.totalSubscribers.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Total Revenue</h3>
          <p className="text-3xl font-bold">
            ${analytics.metrics.totalRevenue.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Average Revenue</h3>
          <p className="text-3xl font-bold">
            ${analytics.metrics.averageRevenue.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="mb-2 text-lg font-semibold">Churn Rate</h3>
          <p className="text-3xl font-bold">
            {(analytics.metrics.churnRate * 100).toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Subscription Trends</h3>
          <div className="max-h-80 overflow-y-auto">
            {trends.map(trend => (
              <div
                key={trend.period}
                className="mb-2 flex items-center justify-between"
              >
                <span>{trend.period}</span>
                <div className="flex space-x-4">
                  <span className="text-green-500">
                    +{(trend.growth_rate * 100).toFixed(1)}%
                  </span>
                  <span className="text-red-500">
                    -{(trend.churn_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-4 text-lg font-semibold">Revenue by Tier</h3>
          <div className="max-h-80 overflow-y-auto">
            {revenue.map(item => (
              <div
                key={`${item.date}-${item.tier}`}
                className="mb-2 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{item.tier}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>${item.revenue.toLocaleString()}</span>
                  <span className="text-sm text-gray-500">
                    ({item.subscribers} subscribers)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
