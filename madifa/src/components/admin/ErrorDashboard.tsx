import React, { useState } from 'react'
import { useDataFetch } from '@/hooks/useDataFetch'
import { getErrorReports, getErrorStats } from '@/lib/services/sentry'
import type { ErrorReport } from '@/lib/services/sentry'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

export function ErrorDashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  })

  const { data: errorReports } = useDataFetch(
    ['error-reports', dateRange],
    () => getErrorReports(dateRange)
  )

  const { data: errorStats } = useDataFetch(
    'error-stats',
    getErrorStats
  )

  const chartData = errorStats
    ? Object.entries(errorStats).map(([type, count]) => ({
        type,
        count
      }))
    : []

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Error Reports</h2>
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

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Error Distribution</h3>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Errors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errorReports?.map((report: ErrorReport) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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