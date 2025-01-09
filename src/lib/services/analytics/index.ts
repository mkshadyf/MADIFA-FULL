import type {
  AnalyticsEvent,
  ViewingStats,
  ViewSession,
} from '@/types/analytics'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export const analyticsService = {
  async trackView(contentId: string, userId: string): Promise<ViewSession> {
    const { data, error } = await supabase
      .from('view_sessions')
      .insert([
        {
          content_id: contentId,
          user_id: userId,
          started_at: new Date().toISOString(),
          progress: 0,
          last_position: 0,
          stats: {
            totalTime: 0,
            pauseCount: 0,
            seekCount: 0,
            qualityChanges: 0,
            bufferingEvents: 0,
            averageBufferDuration: 0,
          },
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateViewProgress(
    session: ViewSession,
    progress: number,
    stats?: Partial<ViewingStats>
  ): Promise<void> {
    const { error } = await supabase
      .from('view_sessions')
      .update({
        progress,
        last_position: progress,
        stats: stats ? { ...session.stats, ...stats } : session.stats,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    if (error) throw error
  },

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const { error } = await supabase.from('analytics_events').insert([
      {
        ...event,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) throw error
  },

  async generateReport(
    startDate: Date,
    endDate: Date,
    filters?: {
      userId?: string
      contentId?: string
      eventType?: string
    }
  ): Promise<{
    totalViews: number
    uniqueViewers: number
    averageWatchTime: number
    completionRate: number
    events: AnalyticsEvent[]
  }> {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId)
    }
    if (filters?.contentId) {
      query = query.eq('video_id', filters.contentId)
    }
    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType)
    }

    const { data: events, error } = await query

    if (error) throw error

    // Calculate metrics
    const uniqueViewers = new Set(events.map(e => e.user_id)).size
    const viewEvents = events.filter(e => e.event_type === 'play')
    const completeEvents = events.filter(e => e.event_type === 'complete')
    const watchTimeEvents = events.filter(e => e.event_type === 'progress')

    return {
      totalViews: viewEvents.length,
      uniqueViewers,
      averageWatchTime:
        watchTimeEvents.reduce(
          (acc, curr) => acc + (curr.data?.duration || 0),
          0
        ) / watchTimeEvents.length,
      completionRate: completeEvents.length / viewEvents.length,
      events,
    }
  },
}
