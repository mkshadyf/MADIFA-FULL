export interface AnalyticsEvent {
  user_id: string
  video_id: string
  event_type:
    | 'play'
    | 'pause'
    | 'seek'
    | 'complete'
    | 'quality_change'
    | 'error'
    | 'buffer'
    | 'progress'
  timestamp: number
  data?: {
    position?: number
    quality?: string
    duration?: number
    message?: string
    bufferDuration?: number
    [key: string]: any
  }
}

export interface ViewSession {
  id: string
  user_id: string
  content_id: string
  started_at: string
  ended_at?: string
  progress: number
  last_position: number
  stats: ViewingStats
  created_at: string
  updated_at: string
}

export interface ViewingStats {
  totalTime: number
  pauseCount: number
  seekCount: number
  qualityChanges: number
  bufferingEvents: number
  averageBufferDuration: number
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  events: AnalyticsEvent[]
}

export interface RealTimeStats {
  currentViewers: number
  peakViewers: number
  lastMinuteEvents: AnalyticsEvent[]
  activeRegions: Array<{
    country: string
    viewers: number
  }>
  qualityDistribution: Record<string, number>
  bufferingCount: number
}

export interface AnalyticsPeriod {
  from: string
  to: string
}

export interface AnalyticsFilter {
  period?: AnalyticsPeriod
  userId?: string
  videoId?: string
  eventType?: AnalyticsEvent['event_type']
  country?: string
  region?: string
  city?: string
}

export interface AnalyticsReport {
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  events: AnalyticsEvent[]
}

export interface GeoData {
  id: string
  value: number
}

export interface SubscriptionAnalyticsItem {
  date: string
  total_subscribers: number
  new_subscribers: number
  churned_subscribers: number
  total_trials: number
  revenue: number
  tier_distribution: Record<string, number>
}

export interface SubscriptionAnalytics {
  data: SubscriptionAnalyticsItem[]
  metrics: SubscriptionMetrics
}

export interface SubscriptionMetrics {
  totalSubscribers: number
  totalRevenue: number
  averageRevenue: number
  churnRate: number
  conversionRate: number
}

export interface SubscriptionTrend {
  period: string
  growth_rate: number
  churn_rate: number
  revenue_growth: number
}

export interface RevenueTier {
  date: string
  tier: string
  revenue: number
  subscribers: number
}

export interface AnalyticsFilter {
  startDate?: string
  endDate?: string
  tier?: string
  interval?: 'day' | 'week' | 'month'
}

export interface AnalyticsError {
  code: string
  message: string
  details?: unknown
}
