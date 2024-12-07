import { createClient } from '@/lib/supabase/client'
import type { AnalyticsEvent, RealTimeStats } from '@/types/analytics'
import { useEffect, useState } from 'react'

const HEARTBEAT_INTERVAL = 30000 // 30 seconds
const STALE_THRESHOLD = 60000 // 1 minute

export function useRealTimeAnalytics(videoId: string) {
  const [stats, setStats] = useState<RealTimeStats>({
    currentViewers: 0,
    peakViewers: 0,
    lastMinuteEvents: [],
    activeRegions: [],
    qualityDistribution: {},
    bufferingCount: 0
  })

  const supabase = createClient()

  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout

    const channel = supabase
      .channel(`video:${videoId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const viewers = Object.keys(presenceState).length

        setStats((prev) => ({
          ...prev,
          currentViewers: viewers,
          peakViewers: Math.max(prev.peakViewers, viewers)
        }))
      })
      .on('broadcast', { event: 'analytics' }, ({ payload }) => {
        const event = payload as AnalyticsEvent

        setStats((prev) => {
          const now = Date.now()
          const recentEvents = [
            ...prev.lastMinuteEvents.filter(
              (e) => now - new Date(e.timestamp).getTime() < STALE_THRESHOLD
            ),
            event
          ]

          const newStats = { ...prev, lastMinuteEvents: recentEvents }

          // Update quality distribution
          if (event.event_type === 'quality_change' && event.data?.quality) {
            const quality = event.data.quality
            newStats.qualityDistribution = {
              ...prev.qualityDistribution,
              [quality]: (prev.qualityDistribution[quality] || 0) + 1
            }
          }

          // Update buffering count
          if (event.event_type === 'buffer_start') {
            newStats.bufferingCount = prev.bufferingCount + 1
          }

          // Update active regions
          if (event.data?.location_info?.country) {
            const country = event.data.location_info.country
            const regionIndex = prev.activeRegions.findIndex(
              (r) => r.country === country
            )

            if (regionIndex === -1) {
              newStats.activeRegions = [
                ...prev.activeRegions,
                { country, viewers: 1 }
              ]
            } else {
              newStats.activeRegions = prev.activeRegions.map((r, i) =>
                i === regionIndex ? { ...r, viewers: r.viewers + 1 } : r
              )
            }
          }

          return newStats
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            video_id: videoId
          })
        }
      })

    // Send heartbeat events
    heartbeatInterval = setInterval(async () => {
      await channel.track({
        online_at: new Date().toISOString(),
        video_id: videoId,
        event_type: 'heartbeat'
      })
    }, HEARTBEAT_INTERVAL)

    return () => {
      clearInterval(heartbeatInterval)
      channel.unsubscribe()
    }
  }, [videoId, supabase])

  return stats
} 