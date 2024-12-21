import React from "react"
import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import 'chart.js/auto' // This registers the controllers
import { analyticsService } from '@/lib/services/analytics'

import type { AnalyticsReport } from '@/types/analytics'

interface ContentAnalyticsDashboardProps {
  contentId: string
}

export default function ContentAnalyticsDashboard({
  contentId,
}: ContentAnalyticsDashboardProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [analytics, setAnalytics] = useState<AnalyticsReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const endDate = new Date()
        const startDate = new Date()
        
        // Calculate start date based on period
        switch(period) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(startDate.getDate() - 30)
            break
          case '90d':
            startDate.setDate(startDate.getDate() - 90)
            break
        }

        const data = await analyticsService.generateReport(startDate, endDate, {
          contentId
        })
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setError(
          error instanceof Error ? error.message : 'Failed to load analytics'
        )
      } finally {
        setLoading(false)
      }
    }

    void fetchAnalytics()
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
            {analytics.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-medium text-white">Completion Rate</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-500">
            {(analytics.completionRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-medium text-white">Average Watch Time</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-500">
            {Math.round(analytics.averageWatchTime / 60)} min
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
            labels: analytics.events
              .filter(e => e.event_type === 'play')
              .map(e => new Date(e.timestamp).toLocaleDateString()),
            datasets: [
              {
                label: 'Views',
                data: analytics.events
                  .filter(e => e.event_type === 'play')
                  .map(() => 1),
                borderColor: 'rgb(99, 102, 241)',
                tension: 0.1,
              },
              {
                label: 'Completions',
                data: analytics.events
                  .filter(e => e.event_type === 'complete')
                  .map(() => 1),
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
            Unique Viewers
          </h3>
          <p className="mt-2 text-3xl font-bold text-indigo-500">
            {analytics.uniqueViewers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="mb-4 text-lg font-medium text-white">
            Event Distribution
          </h3>
          <Bar
            data={{
              labels: ['Play', 'Complete', 'Progress'],
              datasets: [
                {
                  label: 'Events',
                  data: [
                    analytics.events.filter(e => e.event_type === 'play').length,
                    analytics.events.filter(e => e.event_type === 'complete').length,
                    analytics.events.filter(e => e.event_type === 'progress').length,
                  ],
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
            Watch Time Distribution
          </h3>
          <Doughnut
            data={{
              labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
              datasets: [
                {
                  data: [25, 25, 25, 25], // Replace with actual watch time distribution
                  backgroundColor: ['#4F46E5', '#7C3AED', '#A78BFA', '#C4B5FD'],
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
