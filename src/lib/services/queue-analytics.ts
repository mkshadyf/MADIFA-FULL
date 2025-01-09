import { createClient } from '../supabase/client'

interface QueueEfficiency {
  spaceEfficiency: number
  timeEfficiency: number
  priorityAlignment: number
  recommendations: string[]
}

interface QueueHistory {
  dates: string[]
  metrics: {
    spaceEfficiency: number[]
    timeEfficiency: number[]
    priorityAlignment: number[]
  }
}

class QueueAnalyticsService {
  private supabase = createClient()

  async analyzeQueueEfficiency(userId: string): Promise<QueueEfficiency> {
    // Fetch queue data and analyze
    const { data: queueItems } = await this.supabase
      .from('download_queue')
      .select('*')
      .eq('user_id', userId)

    // Calculate metrics
    const spaceEfficiency = this.calculateSpaceEfficiency(queueItems || [])
    const timeEfficiency = this.calculateTimeEfficiency(queueItems || [])
    const priorityAlignment = this.calculatePriorityAlignment(queueItems || [])
    const recommendations = this.generateRecommendations(
      spaceEfficiency,
      timeEfficiency,
      priorityAlignment
    )

    return {
      spaceEfficiency,
      timeEfficiency,
      priorityAlignment,
      recommendations,
    }
  }

  async trackQueueMetrics(userId: string): Promise<void> {
    const metrics = await this.analyzeQueueEfficiency(userId)
    await this.supabase.from('queue_metrics').insert([
      {
        user_id: userId,
        space_efficiency: metrics.spaceEfficiency,
        time_efficiency: metrics.timeEfficiency,
        priority_alignment: metrics.priorityAlignment,
      },
    ])
  }

  async getQueueHistory(userId: string): Promise<QueueHistory> {
    const { data: metrics } = await this.supabase
      .from('queue_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    return {
      dates: (metrics || []).map(m => m.created_at),
      metrics: {
        spaceEfficiency: (metrics || []).map(m => m.space_efficiency),
        timeEfficiency: (metrics || []).map(m => m.time_efficiency),
        priorityAlignment: (metrics || []).map(m => m.priority_alignment),
      },
    }
  }

  private calculateSpaceEfficiency(queueItems: any[]): number {
    // Implement space efficiency calculation
    return queueItems.length > 0 ? 0.8 : 1.0
  }

  private calculateTimeEfficiency(queueItems: any[]): number {
    // Implement time efficiency calculation
    return queueItems.length > 0 ? 0.9 : 1.0
  }

  private calculatePriorityAlignment(queueItems: any[]): number {
    // Implement priority alignment calculation
    return queueItems.length > 0 ? 0.7 : 1.0
  }

  private generateRecommendations(
    spaceEfficiency: number,
    timeEfficiency: number,
    priorityAlignment: number
  ): string[] {
    const recommendations: string[] = []

    if (spaceEfficiency < 0.5) {
      recommendations.push('Consider removing completed or stale downloads')
    }
    if (timeEfficiency < 0.7) {
      recommendations.push('Try organizing downloads by priority')
    }
    if (priorityAlignment < 0.6) {
      recommendations.push('Review queue order to match your priorities')
    }

    return recommendations
  }
}

export const queueAnalytics = new QueueAnalyticsService()
