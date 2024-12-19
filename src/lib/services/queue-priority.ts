import type { Content } from '@/types'

import { createClient } from '@/lib/supabase/client'

import { downloadQueueManager } from './download-queue'
import { storageQuotaManager } from './storage-quota'

const supabase = createClient()

class QueuePriorityManager {
  private static instance: QueuePriorityManager
  private readonly PRIORITY_LEVELS = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  static getInstance(): QueuePriorityManager {
    if (!QueuePriorityManager.instance) {
      QueuePriorityManager.instance = new QueuePriorityManager()
    }
    return QueuePriorityManager.instance
  }

  async calculateContentPriority(
    content: Content,
    userId: string
  ): Promise<number> {
    const factors = await this.getPriorityFactors(content, userId)
    return this.computePriorityScore(factors)
  }

  private async getPriorityFactors(
    content: Content,
    userId: string
  ): Promise<{
    userPreference: number
    size: number
    popularity: number
    expirationRisk: number
    watchHistory: number
  }> {
    const [userPreference, popularity, watchHistory, expirationRisk] =
      await Promise.all([
        this.getUserPreferenceFactor(content, userId),
        this.getPopularityFactor(content),
        this.getWatchHistoryFactor(content, userId),
        this.getExpirationRiskFactor(content),
      ])

    const size = this.getSizeFactor(content.size || 0)

    return {
      userPreference,
      size,
      popularity,
      expirationRisk,
      watchHistory,
    }
  }

  private async getUserPreferenceFactor(
    content: Content,
    userId: string
  ): Promise<number> {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('preferred_categories, preferred_tags')
      .eq('user_id', userId)
      .single()

    if (!preferences) return 0.5

    const categoryMatch = preferences.preferred_categories.includes(
      content.category
    )
    const tagMatches =
      content.tags?.filter(tag => preferences.preferred_tags.includes(tag))
        .length || 0

    return categoryMatch ? 0.8 : tagMatches > 0 ? 0.6 : 0.4
  }

  private getSizeFactor(size: number): number {
    // Prefer smaller files when storage is limited
    const MAX_PREFERRED_SIZE = 500 * 1024 * 1024 // 500MB
    return Math.max(0.2, 1 - size / MAX_PREFERRED_SIZE)
  }

  private async getPopularityFactor(content: Content): Promise<number> {
    const { data: stats } = await supabase
      .from('content_stats')
      .select('view_count, download_count')
      .eq('content_id', content.id)
      .single()

    if (!stats) return 0.5

    const totalEngagement = stats.view_count + stats.download_count
    return Math.min(1, totalEngagement / 1000) // Normalize to 0-1
  }

  private async getWatchHistoryFactor(
    content: Content,
    userId: string
  ): Promise<number> {
    const { data: history } = await supabase
      .from('view_sessions')
      .select('progress')
      .eq('content_id', content.id)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Prioritize partially watched content
    return history ? (history.progress < 0.9 ? 0.8 : 0.3) : 0.5
  }

  private async getExpirationRiskFactor(content: Content): Promise<number> {
    // Check if content might be removed soon
    const { data: metadata } = await supabase
      .from('content_metadata')
      .select('expiration_date, availability_window')
      .eq('content_id', content.id)
      .single()

    if (!metadata?.expiration_date) return 0.5

    const daysUntilExpiration = Math.max(
      0,
      (new Date(metadata.expiration_date).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    )

    return daysUntilExpiration < 7 ? 1 : daysUntilExpiration < 30 ? 0.7 : 0.4
  }

  private computePriorityScore(factors: {
    userPreference: number
    size: number
    popularity: number
    expirationRisk: number
    watchHistory: number
  }): number {
    const weights = {
      userPreference: 0.3,
      size: 0.15,
      popularity: 0.2,
      expirationRisk: 0.2,
      watchHistory: 0.15,
    }

    return Object.entries(factors).reduce((score, [factor, value]) => {
      return score + value * weights[factor as keyof typeof weights]
    }, 0)
  }

  async optimizeQueuePriorities(userId: string): Promise<void> {
    const queueItems = await downloadQueueManager.getQueueItems()
    const quota = await storageQuotaManager.getUserQuota(userId)

    // Calculate priorities for all items
    const itemsWithPriority = await Promise.all(
      queueItems.map(async item => ({
        ...item,
        calculatedPriority: await this.calculateContentPriority(
          item.content,
          userId
        ),
      }))
    )

    // Sort by calculated priority
    const sortedItems = itemsWithPriority.sort(
      (a, b) => b.calculatedPriority - a.calculatedPriority
    )

    // Update queue order and priorities
    await downloadQueueManager.reorderQueue(
      sortedItems.map(item => ({
        id: item.id,
        priority: Math.round(
          item.calculatedPriority * this.PRIORITY_LEVELS.HIGH
        ),
      }))
    )
  }
}

export const queuePriorityManager = QueuePriorityManager.getInstance()
