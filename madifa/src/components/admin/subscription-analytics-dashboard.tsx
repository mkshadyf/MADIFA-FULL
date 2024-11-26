

import { useEffect, useState } from 'react'
import { getSubscriptionMetrics } from '@/lib/services/subscription-analytics'
import type { PlanId } from '@/lib/config/subscription-plans'

export default function SubscriptionAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<{
    totalSubscribers: number
    activeSubscribers: number
    churnRate: number
    mrr: number
    planDistribution: Record<PlanId, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const data = await getSubscriptionMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!metrics) return <div>Error loading metrics</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Total Subscribers</h3>
          <p className="text-3xl font-bold text-white">{metrics.totalSubscribers}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Active Subscribers</h3>
          <p className="text-3xl font-bold text-white">{metrics.activeSubscribers}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Churn Rate</h3>
          <p className="text-3xl font-bold text-white">{metrics.churnRate.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">MRR</h3>
          <p className="text-3xl font-bold text-white">${metrics.mrr.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Plan Distribution</h3>
        <div className="space-y-4">
          {Object.entries(metrics.planDistribution).map(([plan, count]) => (
            <div key={plan} className="flex items-center">
              <div className="w-32 text-gray-300 capitalize">{plan}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600"
                    style={{
                      width: `${(count / metrics.activeSubscribers) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-gray-300">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
