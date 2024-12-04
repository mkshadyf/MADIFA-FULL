export interface ViewingStats {
  totalTime: number
  pauseCount: number
  seekCount: number
  qualityChanges: number
  bufferingEvents: number
  averageBufferDuration: number
}

export interface AnalyticsEvent {
  user_id: string
  video_id: string
  event_type: 'play' | 'pause' | 'seek' | 'complete' | 'quality_change' | 'error' | 'buffer' | 'progress'
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

export interface AnalyticsReport {
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  events: AnalyticsEvent[]
} 