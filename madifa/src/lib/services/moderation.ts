import { createAPIError } from '@/lib/error'
import { supabase } from '@/lib/supabase/client'
import type { ContentFlag, ModerationAction, ModerationRule } from '@/types/moderation'

export class ModerationService {
  async scanContent(content: {
    videoId: string
    title: string
    description: string
    thumbnailUrl: string
  }): Promise<ContentFlag[]> {
    try {
      const flags: ContentFlag[] = []

      // Text content moderation
      const textFlags = await this.moderateText({
        title: content.title,
        description: content.description
      })
      flags.push(...textFlags)

      // Image moderation for thumbnail
      const imageFlags = await this.moderateImage(content.thumbnailUrl)
      flags.push(...imageFlags)

      // Video content moderation
      const videoFlags = await this.moderateVideo(content.videoId)
      flags.push(...videoFlags)

      // Store moderation results
      await this.storeModerationResults(content.videoId, flags)

      return flags
    } catch (error) {
      throw createAPIError(500, 'Content moderation failed', 'MODERATION_ERROR', error)
    }
  }

  async getModerationRules(): Promise<ModerationRule[]> {
    try {
      const { data, error } = await supabase
        .from('moderation_rules')
        .select('*')
        .order('severity', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(500, 'Failed to get moderation rules', 'GET_RULES_ERROR', error)
    }
  }

  async updateModerationRule(ruleId: string, updates: Partial<ModerationRule>): Promise<ModerationRule> {
    try {
      const { data, error } = await supabase
        .from('moderation_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw createAPIError(500, 'Failed to update moderation rule', 'UPDATE_RULE_ERROR', error)
    }
  }

  async getModerationHistory(contentId: string): Promise<{
    flags: ContentFlag[]
    actions: ModerationAction[]
  }> {
    try {
      const [flagsResult, actionsResult] = await Promise.all([
        supabase
          .from('content_flags')
          .select('*')
          .eq('content_id', contentId),
        supabase
          .from('moderation_actions')
          .select('*')
          .eq('content_id', contentId)
      ])

      if (flagsResult.error) throw flagsResult.error
      if (actionsResult.error) throw actionsResult.error

      return {
        flags: flagsResult.data,
        actions: actionsResult.data
      }
    } catch (error) {
      throw createAPIError(500, 'Failed to get moderation history', 'GET_HISTORY_ERROR', error)
    }
  }

  async takeModerationAction(action: ModerationAction): Promise<void> {
    try {
      // Record the action
      const { error: actionError } = await supabase
        .from('moderation_actions')
        .insert(action)

      if (actionError) throw actionError

      // Apply the action
      switch (action.type) {
        case 'remove':
          await this.removeContent(action.content_id)
          break
        case 'restrict':
          await this.restrictContent(action.content_id, action.restrictions ?? [])
          break
        case 'warn':
          await this.warnUser(action.content_id, action.message ?? '')
          break
        default:
          throw new Error(`Unknown action type: ${action.type}`)
      }
    } catch (error) {
      throw createAPIError(500, 'Failed to take moderation action', 'MODERATION_ACTION_ERROR', error)
    }
  }

  async appealModeration(contentId: string, appeal: {
    reason: string
    evidence?: string
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('moderation_appeals')
        .insert({
          content_id: contentId,
          reason: appeal.reason,
          evidence: appeal.evidence,
          status: 'pending',
          submitted_at: new Date()
        })

      if (error) throw error
    } catch (error) {
      throw createAPIError(500, 'Failed to submit appeal', 'APPEAL_ERROR', error)
    }
  }

  private async moderateText(content: { title: string; description: string }): Promise<ContentFlag[]> {
    const flags: ContentFlag[] = []
    const rules = await this.getModerationRules()

    // Check title and description against rules
    for (const rule of rules) {
      if (rule.type !== 'text') continue

      const pattern = new RegExp(rule.pattern, 'i')
      if (pattern.test(content.title) || pattern.test(content.description)) {
        flags.push({
          type: 'text',
          rule_id: rule.id,
          severity: rule.severity,
          details: `Found prohibited content matching rule: ${rule.name}`
        })
      }
    }

    return flags
  }

  private async moderateImage(imageUrl: string): Promise<ContentFlag[]> {
    // Implement image moderation using external API or ML model
    // This is a placeholder implementation
    return []
  }

  private async moderateVideo(videoId: string): Promise<ContentFlag[]> {
    // Implement video content moderation using external API or ML model
    // This is a placeholder implementation
    return []
  }

  private async storeModerationResults(contentId: string, flags: ContentFlag[]): Promise<void> {
    if (flags.length === 0) return

    try {
      const { error } = await supabase
        .from('content_flags')
        .insert(flags.map(flag => ({
          content_id: contentId,
          ...flag,
          created_at: new Date()
        })))

      if (error) throw error
    } catch (error) {
      throw createAPIError(500, 'Failed to store moderation results', 'STORE_RESULTS_ERROR', error)
    }
  }

  private async removeContent(contentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content')
        .update({ status: 'removed' })
        .eq('id', contentId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(500, 'Failed to remove content', 'REMOVE_CONTENT_ERROR', error)
    }
  }

  private async restrictContent(contentId: string, restrictions: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('content')
        .update({ restrictions })
        .eq('id', contentId)

      if (error) throw error
    } catch (error) {
      throw createAPIError(500, 'Failed to restrict content', 'RESTRICT_CONTENT_ERROR', error)
    }
  }

  private async warnUser(contentId: string, message: string): Promise<void> {
    try {
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select('user_id')
        .eq('id', contentId)
        .single()

      if (contentError) throw contentError

      const { error: warningError } = await supabase
        .from('user_warnings')
        .insert({
          user_id: content.user_id,
          content_id: contentId,
          message,
          created_at: new Date()
        })

      if (warningError) throw warningError
    } catch (error) {
      throw createAPIError(500, 'Failed to warn user', 'WARN_USER_ERROR', error)
    }
  }
}

export const moderationService = new ModerationService() 
