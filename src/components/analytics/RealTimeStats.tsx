import React from "react"
 
import type { RealTimeStats as RealTimeStatsType } from '@/types/analytics'

interface RealTimeStatsProps {
  stats: RealTimeStatsType
}

export function RealTimeStats({ stats }: RealTimeStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-500">Current Viewers</h4>
          <p className="mt-2 text-2xl font-semibold">{stats.currentViewers}</p>
          <p className="mt-1 text-sm text-gray-500">
            Peak: {stats.peakViewers}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-500">
            Quality Distribution
          </h4>
          <div className="mt-2 space-y-1">
            {Object.entries(stats.qualityDistribution).map(
              ([quality, count]) => (
                <div key={quality} className="flex justify-between">
                  <span className="text-sm text-gray-600">{quality}</span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="text-sm font-medium text-gray-500">
            Buffering Events
          </h4>
          <p className="mt-2 text-2xl font-semibold">{stats.bufferingCount}</p>
          <p className="mt-1 text-sm text-gray-500">In the last minute</p>
        </div>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-4 text-sm font-medium text-gray-500">
          Recent Events
        </h4>
        <div className="space-y-2">
          {stats.lastMinuteEvents.map((event, index) => (
            <div
              key={event.video_id || index}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium text-gray-900">
                  {event.event_type}
                </span>
                {event.data?.quality ? (
                  <span className="ml-2 text-gray-500">
                    Quality: {event.data.quality}
                  </span>
                ) : null}
                {event.data?.location_info?.country ? (
                  <span className="ml-2 text-gray-500">
                    Location: {event.data.location_info.country}
                  </span>
                ) : null}
              </div>
              <time className="text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </time>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
