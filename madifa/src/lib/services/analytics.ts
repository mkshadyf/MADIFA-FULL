import { createClient } from '@/lib/supabase/client'

interface ContentMetrics {
  views: number
  completions: number
  averageWatchTime: number
  engagementRate: number
  totalLikes: number
  uniqueViewers: number
}

interface ViewerDemographics {
  ageGroups: Record<string, number>
  regions: Record<string, number>
  devices: Record<string, number>
}

interface ContentPerformance {
  id: string
  title: string
  metrics: ContentMetrics
  demographics: ViewerDemographics
  trendData: {
    date: string
    views: number
    engagement: number
  }[]
}

export async function getContentAnalytics(contentId: string, period: '7d' | '30d' | '90d'): Promise<ContentPerformance> {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(period))

  try {
    // Get basic content info
    const { data: content } = await supabase
      .from('content')
      .select('id, title')
      .eq('id', contentId)
      .single()

    // Get view metrics
    const { data: viewMetrics } = await supabase
      .from('content_views')
      .select('*')
      .eq('content_id', contentId)
      .gte('created_at', startDate.toISOString())

    // Get engagement metrics
    const { data: engagementMetrics } = await supabase
      .from('content_engagement')
      .select('*')
      .eq('content_id', contentId)
      .gte('created_at', startDate.toISOString())

    // Calculate metrics
    const metrics: ContentMetrics = {
      views: viewMetrics?.length || 0,
      completions: viewMetrics?.filter(v => v.completion_rate >= 0.9).length || 0,
      averageWatchTime: viewMetrics?.reduce((acc, v) => acc + v.watch_time, 0) / (viewMetrics?.length || 1) || 0,
      engagementRate: (engagementMetrics?.length || 0) / (viewMetrics?.length || 1),
      totalLikes: engagementMetrics?.filter(e => e.type === 'like').length || 0,
      uniqueViewers: new Set(viewMetrics?.map(v => v.user_id)).size || 0
    }

    // Get viewer demographics
    const { data: demographics } = await supabase
      .from('viewer_demographics')
      .select('*')
      .eq('content_id', contentId)

    // Get trend data
    const { data: trends } = await supabase
      .from('content_trends')
      .select('date, views, engagement')
      .eq('content_id', contentId)
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true })

    return {
      id: content.id,
      title: content.title,
      metrics,
      demographics: {
        ageGroups: demographics?.age_groups || {},
        regions: demographics?.regions || {},
        devices: demographics?.devices || {}
      },
      trendData: trends || []
    }
  } catch (error) {
    console.error('Error fetching content analytics:', error)
    throw error
  }
}

export async function trackContentView(
  contentId: string,
  userId: string,
  watchTime: number,
  completionRate: number,
  deviceInfo: Record<string, any>
) {
  const supabase = createClient()

  try {
    await supabase
      .from('content_views')
      .insert({
        content_id: contentId,
        user_id: userId,
        watch_time: watchTime,
        completion_rate: completionRate,
        device_info: deviceInfo,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error tracking content view:', error)
    throw error
  }
}

export async function trackEngagement(
  contentId: string,
  userId: string,
  type: 'like' | 'share' | 'comment',
  metadata?: Record<string, any>
) {
  const supabase = createClient()

  try {
    await supabase
      .from('content_engagement')
      .insert({
        content_id: contentId,
        user_id: userId,
        type,
        metadata,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error tracking engagement:', error)
    throw error
  }
} 
