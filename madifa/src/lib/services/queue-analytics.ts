import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/types'
import { downloadQueueManager } from './download-queue'
import { storageQuotaManager } from './storage-quota'

const supabase = createClient()

class QueueAnalyticsManager {
  private static instance: QueueAnalyticsManager

  static getInstance(): QueueAnalyticsManager {
    if (!QueueAnalyticsManager.instance) {
      QueueAnalyticsManager.instance = new QueueAnalyticsManager()
    }
    return QueueAnalyticsManager.instance
  }

  async analyzeQueueEfficiency(userId: string): Promise<{
    spaceEfficiency: number
    timeEfficiency: number
    priorityAlignment: number
    recommendations: string[]
  }> {
    const [queueItems, quota] = await Promise.all([
      downloadQueueManager.getQueueItems(),
      storageQuotaManager.getUserQuota(userId)
    ])

    const totalSize = queueItems.reduce((sum, item) => sum + (item.content.size || 0), 0)
    const spaceEfficiency = Math.min(1, quota / totalSize)

    const timeEfficiency = this.calculateTimeEfficiency(queueItems)
    const priorityAlignment = await this.calculatePriorityAlignment(queueItems, userId)
    const recommendations = this.generateRecommendations(
      spaceEfficiency,
      timeEfficiency,
      priorityAlignment,
      queueItems
    )

    return {
      spaceEfficiency,
      timeEfficiency,
      priorityAlignment,
      recommendations
    }
  }

  private calculateTimeEfficiency(queueItems: Array<{ content: Content; priority: number }>): number {
    const totalTime = queueItems.reduce((sum, item) => sum + (item.content.duration || 0), 0)
    const weightedTime = queueItems.reduce(
      (sum, item) => sum + ((item.content.duration || 0) * item.priority),
      0
    )
    return weightedTime / (totalTime * Math.max(...queueItems.map(item => item.priority)))
  }

  private async calculatePriorityAlignment(
    queueItems: Array<{ content: Content; priority: number }>,
    userId: string
  ): Promise<number> {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('preferred_categories, preferred_tags')
      .eq('user_id', userId)
      .single()

    if (!preferences) return 1

    return queueItems.reduce((sum, item) => {
      const categoryMatch = preferences.preferred_categories.includes(item.content.category)
      const tagMatches = item.content.tags?.filter(tag =>
        preferences.preferred_tags.includes(tag)
      ).length || 0

      const preferenceScore = categoryMatch ? 1 : (tagMatches > 0 ? 0.5 : 0)
      return sum + (preferenceScore * item.priority)
    }, 0) / queueItems.reduce((sum, item) => sum + item.priority, 0)
  }

  private generateRecommendations(
    spaceEfficiency: number,
    timeEfficiency: number,
    priorityAlignment: number,
    queueItems: Array<{ content: Content; priority: number }>
  ): string[] {
    const recommendations: string[] = []

    if (spaceEfficiency < 0.5) {
      recommendations.push(
        'Consider removing lower priority items to improve storage efficiency'
      )
    }

    if (timeEfficiency < 0.7) {
      recommendations.push(
        'Reorder queue to prioritize shorter, high-priority content first'
      )
    }

    if (priorityAlignment < 0.6) {
      recommendations.push(
        'Queue items do not strongly align with your preferences. Consider adjusting priorities'
      )
    }

    const largeFiles = queueItems.filter(
      item => (item.content.size || 0) > 500 * 1024 * 1024
    )
    if (largeFiles.length > 3) {
      recommendations.push(
        'Multiple large files detected. Consider spacing out large downloads'
      )
    }

    return recommendations
  }

  async trackQueueMetrics(userId: string): Promise<void> {
    const metrics = await this.analyzeQueueEfficiency(userId)

    await supabase.from('queue_metrics').insert([{
      user_id: userId,
      space_efficiency: metrics.spaceEfficiency,
      time_efficiency: metrics.timeEfficiency,
      priority_alignment: metrics.priorityAlignment,
      timestamp: new Date().toISOString()
    }])
  }

  async getQueueHistory(userId: string, days = 7): Promise<{
    dates: string[]
    metrics: {
      spaceEfficiency: number[]
      timeEfficiency: number[]
      priorityAlignment: number[]
    }
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data } = await supabase
      .from('queue_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true })

    return {
      dates: data?.map(d => d.timestamp) || [],
      metrics: {
        spaceEfficiency: data?.map(d => d.space_efficiency) || [],
        timeEfficiency: data?.map(d => d.time_efficiency) || [],
        priorityAlignment: data?.map(d => d.priority_alignment) || []
      }
    }
  }
}

export const queueAnalytics = QueueAnalyticsManager.getInstance() 