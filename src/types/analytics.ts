export interface AnalyticsEvent {
  id?: string
  user_id?: string
  video_id: string
  event_type:
    | 'play'
    | 'pause'
    | 'seek'
    | 'complete'
    | 'quality_change'
    | 'error'
    | 'view'
    | 'buffer_start'
    | 'buffer_end'
    | 'heartbeat'
  timestamp: string
  data?: Record<string, any>
}

export interface ViewSession {
  id?: string
  user_id?: string
  video_id: string
  start_time: string
  end_time?: string
  duration?: number
  progress: number
  completed: boolean
  quality_changes: number
  buffer_count: number
  total_buffer_time: number
  device_info?: {
    userAgent: string
    platform: string
    browser: string
    os: string
  }
  network_info?: {
    effectiveType: string
    downlink: number
    rtt: number
  }
  location_info?: {
    country: string
    region: string
    city: string
    latitude?: number
    longitude?: number
  }
}

export interface ViewingStats {
  totalViews: number
  uniqueViewers: number
  averageViewDuration: number
  completionRate: number
  engagementScore: number
  qualityDistribution: Record<string, number>
  bufferingEvents: number
  averageBufferDuration: number
  dropOffPoints: Array<{
    time: number
    percentage: number
  }>
  geographicDistribution: Array<{
    country: string
    region: string
    city: string
    views: number
    uniqueViewers: number
  }>
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
  averageWatchTime: number
  engagementRate: number
  totalInteractions: number
  realTimeStats: {
    currentViewers: number
    peakViewers: number
    qualityDistribution: Record<string, number>
    bufferingCount: number
    lastMinuteEvents: Array<{
      id?: string
      event_type: string
      timestamp: string
      data?: {
        quality?: string
        location_info?: {
          country: string
        }
      }
    }>
  }
  geoData: Array<{
    id: string
    value: number
  }>
  videoStats: Array<{
    video_id: string
    title: string
    views: number
    completions: number
    averageEngagement: number
    engagementRate: number
    averageWatchTime: number
    dropOffPoints: Array<{
      time: number
      percentage: number
    }>
  }>
  retentionData: Array<{
    time: number
    percentage: number
  }>
}

export interface GeoData {
  id: string
  value: number
}
