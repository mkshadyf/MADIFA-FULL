import type { PlanId } from '@/lib/config/subscription-plans'
import { createClient } from '@/lib/supabase/server'

interface SubscriptionMetrics {
  totalSubscribers: number
  activeSubscribers: number
  churnRate: number
  mrr: number // Monthly Recurring Revenue
  planDistribution: Record<PlanId, number>
}

export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
  const supabase = createClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    // Get all subscriptions
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')

    // Get cancelled subscriptions in last 30 days
    const { data: cancelledSubs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'cancelled')
      .gte('cancelled_at', thirtyDaysAgo.toISOString())

    // Calculate metrics
    const metrics: SubscriptionMetrics = {
      totalSubscribers: subscriptions?.length || 0,
      activeSubscribers: subscriptions?.filter(s => s.status === 'active').length || 0,
      churnRate: calculateChurnRate(subscriptions || [], cancelledSubs || []),
      mrr: calculateMRR(subscriptions || []),
      planDistribution: calculatePlanDistribution(subscriptions || [])
    }

    return metrics
  } catch (error) {
    console.error('Error fetching subscription metrics:', error)
    throw error
  }
}

function calculateChurnRate(
  allSubs: any[],
  cancelledSubs: any[]
): number {
  if (allSubs.length === 0) return 0
  return (cancelledSubs.length / allSubs.length) * 100
}

function calculateMRR(subscriptions: any[]): number {
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => total + (sub.price || 0), 0)
}

function calculatePlanDistribution(
  subscriptions: any[]
): Record<PlanId, number> {
  const activeSubs = subscriptions.filter(sub => sub.status === 'active')
  const distribution: Record<PlanId, number> = {
    monthly: 0,
    yearly: 0
  }

  activeSubs.forEach(sub => {
    if (distribution[sub.plan_id as PlanId] !== undefined) {
      distribution[sub.plan_id as PlanId]++
    }
  })

  return distribution
} 