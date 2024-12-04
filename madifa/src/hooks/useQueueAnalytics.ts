import { queueAnalytics } from '@/lib/services/queue-analytics'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useToast } from './useToast'

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

export function useQueueAnalytics() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [efficiency, setEfficiency] = useState<QueueEfficiency | null>(null)
  const [history, setHistory] = useState<QueueHistory | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const analyzeQueue = async () => {
      try {
        const metrics = await queueAnalytics.analyzeQueueEfficiency(user.id)
        setEfficiency(metrics)

        // Track metrics
        await queueAnalytics.trackQueueMetrics(user.id)

        // If efficiency is low, show recommendations
        if (
          metrics.spaceEfficiency < 0.5 ||
          metrics.timeEfficiency < 0.7 ||
          metrics.priorityAlignment < 0.6
        ) {
          showToast(
            'Queue optimization recommendations available',
            'info'
          )
        }
      } catch (error) {
        console.error('Failed to analyze queue:', error)
      }
    }

    const loadHistory = async () => {
      try {
        const queueHistory = await queueAnalytics.getQueueHistory(user.id)
        setHistory(queueHistory)
      } catch (error) {
        console.error('Failed to load queue history:', error)
      }
    }

    analyzeQueue()
    loadHistory()

    // Analyze queue periodically
    const interval = setInterval(analyzeQueue, 15 * 60 * 1000) // Every 15 minutes

    return () => {
      clearInterval(interval)
    }
  }, [user, showToast])

  const refreshAnalytics = async () => {
    if (!user || isLoading) return

    try {
      setIsLoading(true)
      const [metrics, queueHistory] = await Promise.all([
        queueAnalytics.analyzeQueueEfficiency(user.id),
        queueAnalytics.getQueueHistory(user.id)
      ])

      setEfficiency(metrics)
      setHistory(queueHistory)
    } catch (error) {
      console.error('Failed to refresh analytics:', error)
      showToast('Failed to refresh queue analytics', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    efficiency,
    history,
    isLoading,
    refreshAnalytics
  }
} 