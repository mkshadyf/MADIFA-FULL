import React, { useState } from 'react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { RealTimeStats } from '@/components/analytics/RealTimeStats';
import { WorldMap } from '@/components/analytics/WorldMap';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { AnalyticsReport } from '@/types/analytics';

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });

  const { data: analyticsData, isLoading } = useAnalytics({
    from: dateRange.startDate.toISOString(),
    to: dateRange.endDate.toISOString()
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!analyticsData) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onStartDateChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
          onEndDateChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Views</h3>
          <p className="text-3xl font-semibold">
            {analyticsData.totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Average Watch Time
          </h3>
          <p className="text-3xl font-semibold">
            {analyticsData.averageWatchTime.toFixed(2)}m
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Engagement Rate
          </h3>
          <p className="text-3xl font-semibold">
            {(analyticsData.engagementRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Interactions
          </h3>
          <p className="text-3xl font-semibold">
            {analyticsData.totalInteractions.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Real-time Activity</h3>
          {analyticsData.realTimeStats && (
            <RealTimeStats stats={analyticsData.realTimeStats} />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Geographic Distribution</h3>
          <div className="h-[400px]">
            <WorldMap data={analyticsData.geoData} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Top Videos</h3>
        <div className="space-y-4">
          {analyticsData.videoStats.map((video) => (
            <div
              key={video.video_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded"
            >
              <div>
                <h4 className="font-medium">{video.title}</h4>
                <p className="text-sm text-gray-500">
                  {video.views.toLocaleString()} views
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {(video.engagementRate * 100).toFixed(1)}% engagement
                </p>
                <p className="text-sm text-gray-500">
                  {video.averageWatchTime.toFixed(1)}m avg. watch time
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Audience Retention</h3>
        <div className="space-y-4">
          {analyticsData.retentionData.map((point) => (
            <div
              key={point.time}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">
                {point.time}s
              </span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{ width: `${point.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium">
                {point.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 