import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

import { getContentAnalytics } from '@/lib/services/analytics'
import type { ContentPerformance } from '@/lib/services/analytics'

interface ContentAnalyticsDashboardProps {
  contentId: string
}

export default function ContentAnalyticsDashboard({
  contentId,
}: ContentAnalyticsDashboardProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [analytics, setAnalytics] = useState<ContentPerformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getContentAnalytics(contentId, period)
        setAnalytics(data)
      } catch (error) {
        logger.error('Error fetching analytics:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load analytics'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [contentId, period])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6 h-96 rounded-lg bg-gray-800"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 rounded-lg bg-gray-800"></div>
          <div className="h-64 rounded-lg bg-gray-800"></div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="py-4 text-center text-red-500">
        {error || 'Failed to load analytics'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-end space-x-2">
        {['7d', '30d', '90d'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p as '7d' | '30d' | '90d')}
            className={`rounded-md px-3 py-1 text-sm ${
              period === p
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-medium text-white">Total Views</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-500">
            {analytics.metrics.views.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-medium text-white">Completion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-500">
            {(
              (analytics.metrics.completions / analytics.metrics.views) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-medium text-white">Engagement Rate</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-500">
            {(analytics.metrics.engagementRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="rounded-lg bg-gray-800 p-6">
        <h3 className="mb-4 text-lg font-medium text-white">
          Performance Trends
        </h3>
        <Line
          data={{
            labels: analytics.trendData.map(d => d.date),
            datasets: [
              {
                label: 'Views',
                data: analytics.trendData.map(d => d.views),
                borderColor: 'rgb(99, 102, 241)',
                tension: 0.1,
              },
              {
                label: 'Engagement',
                data: analytics.trendData.map(d => d.engagement),
                borderColor: 'rgb(139, 92, 246)',
                tension: 0.1,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: 'white' },
              },
              x: {
                ticks: { color: 'white' },
              },
            },
            plugins: {
              legend: {
                labels: { color: 'white' },
              },
            },
          }}
        />
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Age Distribution
          </h3>
          <Doughnut
            data={{
              labels: Object.keys(analytics.demographics.ageGroups),
              datasets: [
                {
                  data: Object.values(analytics.demographics.ageGroups),
                  backgroundColor: [
                    '#4F46E5',
                    '#7C3AED',
                    '#A78BFA',
                    '#C4B5FD',
                    '#DDD6FE',
                  ],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: 'white' },
                },
              },
            }}
          />
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Regional Distribution
          </h3>
          <Bar
            data={{
              labels: Object.keys(analytics.demographics.regions),
              datasets: [
                {
                  label: 'Viewers',
                  data: Object.values(analytics.demographics.regions),
                  backgroundColor: '#4F46E5',
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  ticks: { color: 'white' },
                },
                y: {
                  ticks: { color: 'white' },
                },
              },
            }}
          />
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Device Distribution
          </h3>
          <Doughnut
            data={{
              labels: Object.keys(analytics.demographics.devices),
              datasets: [
                {
                  data: Object.values(analytics.demographics.devices),
                  backgroundColor: ['#4F46E5', '#7C3AED', '#A78BFA'],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { color: 'white' },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
