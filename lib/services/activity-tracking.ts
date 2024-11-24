import { createClient } from '@/lib/supabase/client'

export type ActivityType =
  | 'view'
  | 'search'
  | 'like'
  | 'watchlist_add'
  | 'watchlist_remove'
  | 'profile_update'
  | 'subscription_change'
  | 'content_complete'

interface ActivityData {
  content_id?: string
  search_query?: string
  old_value?: string
  new_value?: string
  metadata?: Record<string, any>
}

export async function trackActivity(
  userId: string,
  type: ActivityType,
  data?: ActivityData
) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        action: type,
        content_id: data?.content_id,
        search_query: data?.search_query,
        old_value: data?.old_value,
        new_value: data?.new_value,
        metadata: data?.metadata,
        created_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Activity tracking error:', error)
    throw error
  }
}

export async function getUserActivity(userId: string, limit = 20) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        *,
        content:content_id (
          title,
          thumbnail_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching user activity:', error)
    throw error
  }
} 