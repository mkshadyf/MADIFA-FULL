import { createClient } from '@/lib/supabase/client'

export interface ModerationAction {
  contentId?: string
  userId?: string
  commentId?: string
  type: 'block' | 'warn' | 'delete' | 'flag'
  reason: string
  moderatorId: string
}

export async function moderateContent(action: ModerationAction) {
  const supabase = createClient()

  try {
    // Log moderation action
    const { error: logError } = await supabase
      .from('moderation_logs')
      .insert({
        content_id: action.contentId,
        user_id: action.userId,
        comment_id: action.commentId,
        action_type: action.type,
        reason: action.reason,
        moderator_id: action.moderatorId
      })

    if (logError) throw logError

    // Apply moderation action
    switch (action.type) {
      case 'block':
        if (action.contentId) {
          await supabase
            .from('content')
            .update({ status: 'blocked', blocked_reason: action.reason })
            .eq('id', action.contentId)
        }
        if (action.userId) {
          await supabase
            .from('user_profiles')
            .update({ status: 'blocked', blocked_reason: action.reason })
            .eq('user_id', action.userId)
        }
        break

      case 'delete':
        if (action.contentId) {
          await supabase
            .from('content')
            .delete()
            .eq('id', action.contentId)
        }
        if (action.commentId) {
          await supabase
            .from('comments')
            .delete()
            .eq('id', action.commentId)
        }
        break

      case 'warn':
        if (action.userId) {
          await supabase.from('user_warnings').insert({
            user_id: action.userId,
            reason: action.reason,
            moderator_id: action.moderatorId
          })
        }
        break
    }

    return { success: true }
  } catch (error) {
    console.error('Moderation error:', error)
    throw error
  }
}

export async function getModerationLogs(options: {
  contentId?: string
  userId?: string
  moderatorId?: string
  limit?: number
  offset?: number
}) {
  const supabase = createClient()

  try {
    let query = supabase
      .from('moderation_logs')
      .select('*, moderator:moderator_id(*)')
      .order('created_at', { ascending: false })

    if (options.contentId) {
      query = query.eq('content_id', options.contentId)
    }
    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }
    if (options.moderatorId) {
      query = query.eq('moderator_id', options.moderatorId)
    }

    const { data, error } = await query
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1)

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching moderation logs:', error)
    throw error
  }
} 