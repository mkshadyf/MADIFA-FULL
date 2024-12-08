import React from 'react'
import { usePerformanceMetrics, type PerformanceMetrics } from '@/hooks/usePerformanceMetrics'
import { RealTimeStats } from '@/components/analytics/RealTimeStats'

function PerformanceDashboard() {
  const { data, isLoading, error } = usePerformanceMetrics()

  if (isLoading) {
    return <div>Loading performance metrics...</div>
  }

  if (error) {
    return <div>Error loading performance metrics: {error.message}</div>
  }

  if (!data) {
    return <div>No performance data available</div>
  }

  const metrics: PerformanceMetrics = data

  const formatMetric = (value: number, unit?: string) => {
    if (unit === 'ms') return `${Math.round(value)}ms`
    if (unit === '%') return `${Math.round(value)}%`
    if (unit === 'MB') return `${value.toFixed(1)} MB`
    return value.toString()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">Web Vitals</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">FCP</span>
              <span className="font-medium">{formatMetric(metrics.webVitals.fcp, 'ms')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LCP</span>
              <span className="font-medium">{formatMetric(metrics.webVitals.lcp, 'ms')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">FID</span>
              <span className="font-medium">{formatMetric(metrics.webVitals.fid, 'ms')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CLS</span>
              <span className="font-medium">{metrics.webVitals.cls.toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">TTFB</span>
              <span className="font-medium">{formatMetric(metrics.webVitals.ttfb, 'ms')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">Cache Performance</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Hit Rate</span>
              <span className="font-medium">{formatMetric(metrics.resourceMetrics.cacheHitRate, '%')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Size</span>
              <span className="font-medium">{formatMetric(metrics.resourceMetrics.cacheSize, 'MB')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cached Resources</span>
              <span className="font-medium">{metrics.resourceMetrics.cachedResources}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-medium mb-4">Resource Optimization</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Images Optimized</span>
              <span className="font-medium">{metrics.resourceMetrics.imagesOptimized}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Space Saved</span>
              <span className="font-medium">{formatMetric(metrics.resourceMetrics.spaceSaved, 'MB')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Compression</span>
              <span className="font-medium">{formatMetric(metrics.resourceMetrics.averageCompression, '%')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-medium mb-4">Real-Time Analytics</h2>
        <RealTimeStats stats={metrics.realTimeStats} />
      </div>
    </div>
  )
}

export default PerformanceDashboard 