import React, { useState } from 'react'
import { useDataFetch } from '@/hooks/useDataFetch'
import { getPerformanceMetrics, getPerformanceStats } from '@/lib/services/performance'
import type { PerformanceMetric } from '@/lib/services/performance'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const metricColors = {
  CLS: '#3B82F6',
  FCP: '#10B981',
  FID: '#F59E0B',
  LCP: '#EF4444',
  TTFB: '#8B5CF6'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

export function PerformanceDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  })

  const { data: metrics } = useDataFetch(
    ['performance-metrics', dateRange],
    () => getPerformanceMetrics(dateRange)
  )

  const { data: stats } = useDataFetch(
    'performance-stats',
    () => getPerformanceStats()
  )

  const chartData = metrics?.reduce((acc: any[], metric: PerformanceMetric) => {
    const existingPoint = acc.find(
      point => point.timestamp === metric.timestamp
    )

    if (existingPoint) {
      existingPoint[metric.name] = metric.value
    } else {
      acc.push({
        timestamp: metric.timestamp,
        [metric.name]: metric.value
      })
    }

    return acc
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.startDate.split('T')[0]}
            onChange={(e) =>
              setDateRange(prev => ({
                ...prev,
                startDate: new Date(e.target.value).toISOString()
              }))
            }
            className="px-3 py-2 border rounded-lg"
            aria-label="Start date"
          />
          <input
            type="date"
            value={dateRange.endDate.split('T')[0]}
            onChange={(e) =>
              setDateRange(prev => ({
                ...prev,
                endDate: new Date(e.target.value).toISOString()
              }))
            }
            className="px-3 py-2 border rounded-lg"
            aria-label="End date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats && Object.entries(stats).map(([metric, data]) => (
          <div
            key={metric}
            className="bg-white rounded-lg shadow p-4"
          >
            <h3 className="text-lg font-semibold mb-2">{metric}</h3>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-gray-500">Average</dt>
                <dd className="font-medium">{data.average.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Samples</dt>
                <dd className="font-medium">{data.total}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Good</dt>
                <dd className="text-green-600 font-medium">
                  {((data.good / data.total) * 100).toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Needs Improvement</dt>
                <dd className="text-yellow-600 font-medium">
                  {((data.needsImprovement / data.total) * 100).toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Poor</dt>
                <dd className="text-red-600 font-medium">
                  {((data.poor / data.total) * 100).toFixed(1)}%
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Metrics Over Time</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => [value.toFixed(2)]}
              />
              <Legend />
              {Object.entries(metricColors).map(([metric, color]) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={color}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
} 