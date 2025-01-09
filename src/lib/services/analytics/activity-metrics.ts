import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/date'
import type { UserProfile } from '@/types/auth'

const supabase = createClient()

export interface ActivityDistribution {
  hourCounts: number[]
  dayCounts: number[]
  mostActiveHour: number
  mostActiveDay: number
}

export async function getActivityDistribution(
  startDate: Date
): Promise<ActivityDistribution> {
  const hourCounts = new Array(24).fill(0)
  const dayCounts = new Array(7).fill(0)

  const { data } = await supabase
    .from('user_activity')
    .select('created_at')
    .gte('created_at', formatDate(startDate))

  data?.forEach(activity => {
    const date = new Date(activity.created_at)
    hourCounts[date.getHours()]++
    dayCounts[date.getDay()]++
  })

  return {
    hourCounts,
    dayCounts,
    mostActiveHour: hourCounts.indexOf(Math.max(...hourCounts)),
    mostActiveDay: dayCounts.indexOf(Math.max(...dayCounts)),
  }
}

export async function getUserActivityCounts(startDate: Date): Promise<number> {
  const { count } = await supabase
    .from('user_activity')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', formatDate(startDate))

  return count || 0
}

export interface TopUser {
  user: UserProfile
  activityCount: number
}

export async function getTopUsersByActivity(
  startDate: Date,
  limit = 5
): Promise<TopUser[]> {
  const { data } = await supabase
    .from('user_activity')
    .select(
      `
      user_id,
      count,
      user_profiles!inner(*)
    `
    )
    .gte('created_at', formatDate(startDate))
    .order('count', { ascending: false })
    .limit(limit)

  return (
    data?.map(item => ({
      user: item.user_profiles as unknown as UserProfile,
      activityCount: parseInt(item.count as unknown as string),
    })) || []
  )
}

export async function getRetentionRate(
  currentPeriodStart: Date,
  previousPeriodStart: Date
): Promise<number> {
  const { count: previousUsers } = await supabase
    .from('user_activity')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', formatDate(previousPeriodStart))
    .lt('created_at', formatDate(currentPeriodStart))

  const { count: retainedUsers } = await supabase
    .from('user_activity')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', formatDate(currentPeriodStart))

  if (!previousUsers) return 0
  return (retainedUsers || 0) / previousUsers
}

export async function getAverageSessionTime(startDate: Date): Promise<number> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('duration')
    .gte('created_at', formatDate(startDate))

  if (!sessions?.length) return 0

  const totalDuration = sessions.reduce(
    (sum, session) => sum + (session.duration || 0),
    0
  )
  return totalDuration / sessions.length
}
