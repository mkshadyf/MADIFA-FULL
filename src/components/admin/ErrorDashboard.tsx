import React, { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getErrorReports, getErrorStats } from '@/lib/services/sentry'
import type { ErrorReport } from '@/lib/services/sentry'
import { useDataFetch } from '@/hooks/useDataFetch'

export function ErrorDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  })

  const { data: errorReports } = useDataFetch(
    ['error-reports', dateRange],
    () => getErrorReports(dateRange)
  )

  const { data: errorStats } = useDataFetch('error-stats', getErrorStats)

  const chartData = errorStats
    ? Object.entries(errorStats).map(([type, count]) => ({
        type,
        count,
      }))
    : []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Error Reports</h2>
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.startDate.split('T')[0]}
            onChange={e =>
              setDateRange(prev => ({
                ...prev,
                startDate: new Date(e.target.value).toISOString(),
              }))
            }
            className="rounded-lg border px-3 py-2"
            aria-label="Start date"
          />
          <input
            type="date"
            value={dateRange.endDate.split('T')[0]}
            onChange={e =>
              setDateRange(prev => ({
                ...prev,
                endDate: new Date(e.target.value).toISOString(),
              }))
            }
            className="rounded-lg border px-3 py-2"
            aria-label="End date"
          />
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 text-lg font-semibold">Error Distribution</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b p-4">
          <h3 className="text-lg font-semibold">Recent Errors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Error Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {errorReports?.map((report: ErrorReport) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {report.errorType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {report.error}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {report.url}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
