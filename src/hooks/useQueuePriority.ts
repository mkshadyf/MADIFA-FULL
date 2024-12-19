import { useEffect, useState } from 'react'
import type { Content } from '@/types'

import { queuePriorityManager } from '@/lib/services/queue-priority'

import { useAuth } from './useAuth'
import { useToast } from './useToast'

export function useQueuePriority() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null)

  useEffect(() => {
    if (!user) return

    // Auto-optimize queue periodically
    const interval = setInterval(
      async () => {
        const lastRun = lastOptimization?.getTime() || 0
        const hoursSinceLastRun = (Date.now() - lastRun) / (1000 * 60 * 60)

        if (hoursSinceLastRun >= 4) {
          // Run every 4 hours
          await optimizeQueue()
        }
      },
      15 * 60 * 1000
    ) // Check every 15 minutes

    return () => {
      clearInterval(interval)
    }
  }, [user, lastOptimization])

  const calculatePriority = async (content: Content) => {
    if (!user) return 0

    try {
      return await queuePriorityManager.calculateContentPriority(
        content,
        user.id
      )
    } catch (error) {
      logger.error('Failed to calculate priority:', error)
      return 0.5 // Default medium priority
    }
  }

  const optimizeQueue = async () => {
    if (!user || isOptimizing) return

    try {
      setIsOptimizing(true)
      await queuePriorityManager.optimizeQueuePriorities(user.id)
      setLastOptimization(new Date())
      showToast('Queue priorities optimized', 'success')
    } catch (error) {
      logger.error('Failed to optimize queue priorities:', error)
      showToast('Failed to optimize queue priorities', 'error')
    } finally {
      setIsOptimizing(false)
    }
  }

  return {
    calculatePriority,
    optimizeQueue,
    isOptimizing,
    lastOptimization,
  }
}
