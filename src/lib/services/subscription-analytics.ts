import { supabase } from '@/lib/supabase/client'
import type {
  RevenueTier,
  SubscriptionAnalytics,
  SubscriptionAnalyticsItem,
  SubscriptionMetrics,
  SubscriptionTrend,
} from '@/types/analytics'

export async function getSubscriptionAnalytics(
  startDate?: string,
  endDate?: string
): Promise<SubscriptionAnalytics> {
  const query = supabase
    .from('subscription_analytics')
    .select('*')
    .order('date', { ascending: false })

  if (startDate) {
    query.gte('date', startDate)
  }
  if (endDate) {
    query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch subscription analytics')
  }

  return {
    data: (data as SubscriptionAnalyticsItem[]) || [],
    metrics: calculateMetrics((data as SubscriptionAnalyticsItem[]) || []),
  }
}

function calculateMetrics(
  data: SubscriptionAnalyticsItem[]
): SubscriptionMetrics {
  const totalSubscribers = data.reduce(
    (acc: number, curr: SubscriptionAnalyticsItem) =>
      acc + curr.total_subscribers,
    0
  )
  const totalRevenue = data.reduce(
    (acc: number, curr: SubscriptionAnalyticsItem) => acc + curr.revenue,
    0
  )
  const averageRevenue = totalRevenue / data.length

  const churnRate =
    data.reduce(
      (acc: number, curr: SubscriptionAnalyticsItem) =>
        acc + curr.churned_subscribers,
      0
    ) / totalSubscribers

  const conversionRate =
    data.reduce(
      (acc: number, curr: SubscriptionAnalyticsItem) =>
        acc + curr.new_subscribers,
      0
    ) /
    data.reduce(
      (acc: number, curr: SubscriptionAnalyticsItem) => acc + curr.total_trials,
      0
    )

  return {
    totalSubscribers,
    totalRevenue,
    averageRevenue,
    churnRate,
    conversionRate,
  }
}

export async function trackSubscriptionEvent(event: {
  user_id: string
  event_type:
    | 'subscription_created'
    | 'subscription_cancelled'
    | 'subscription_renewed'
  subscription_tier: string
  amount?: number
}) {
  const { error } = await supabase.from('subscription_events').insert([
    {
      ...event,
      created_at: new Date().toISOString(),
    },
  ])

  if (error) {
    throw new Error('Failed to track subscription event')
  }
}

export async function getSubscriptionTrends(): Promise<SubscriptionTrend[]> {
  const { data, error } = await supabase.rpc('calculate_subscription_trends')

  if (error) {
    throw new Error('Failed to fetch subscription trends')
  }

  return data as SubscriptionTrend[]
}

export async function getRevenueByTier(
  startDate?: string,
  endDate?: string
): Promise<RevenueTier[]> {
  const query = supabase
    .from('subscription_revenue')
    .select('*')
    .order('date', { ascending: false })

  if (startDate) {
    query.gte('date', startDate)
  }
  if (endDate) {
    query.lte('date', endDate)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch revenue by tier')
  }

  return (data as RevenueTier[]) || []
}
