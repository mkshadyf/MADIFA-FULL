import { vimeoClient } from '@/lib/services/vimeo/vimeo-client'
import { createClient } from '@/lib/supabase/client'
import type { QuotaCheckResult } from '@/types/quota'
import type { SubscriptionPlan } from '@/types/subscription'

export async function updateVideoPrivacy(
  videoId: string,
  isPublic: boolean
): Promise<void> {
  try {
    await vimeoClient.request({
      method: 'PATCH',
      path: `/videos/${videoId}`,
      query: {
        privacy: {
          view: isPublic ? 'anybody' : 'disable',
        },
      },
    })
  } catch (error) {
    console.error('Error updating video privacy:', error)
    throw error
  }
}

export async function handleSubscriptionAccess(
  userId: string,
  plan: SubscriptionPlan,
  action: 'grant' | 'revoke'
): Promise<void> {
  const supabase = createClient()

  try {
    // Get user's content access
    const { data: content } = await supabase
      .from('content')
      .select('vimeo_id')
      .eq('is_published', true)

    if (!content) return

    // Update Vimeo privacy settings based on subscription
    await Promise.all(
      content.map(async item => {
        if (!item.vimeo_id) return
        // If granting access, make video public for subscriber
        // If revoking, make private unless user has another active subscription
        await updateVideoPrivacy(item.vimeo_id, action === 'grant')
      })
    )

    // Log access change
    await supabase.from('subscription_logs').insert({
      user_id: userId,
      plan_id: plan.id,
      action,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling subscription access:', error)
    throw error
  }
}

export async function checkAccess(
  userId: string,
  contentId: string
): Promise<QuotaCheckResult> {
  const supabaseClient = await createClient()

  try {
    // Get content size
    const { data: content } = await supabaseClient
      .from('content')
      .select('size')
      .eq('id', contentId)
      .single()

    if (!content) {
      throw new Error('Content not found')
    }

    // Get user's quota
    const { data: quota } = await supabaseClient
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!quota) {
      throw new Error('No quota found for user')
    }

    const newUsage = quota.current_usage + content.size
    const canProceed = newUsage <= quota.limit

    return {
      allowed: canProceed,
      canProceed,
      currentUsage: quota.current_usage,
      quota: quota.limit,
      remaining: quota.limit - quota.current_usage,
      error: canProceed ? undefined : 'Quota exceeded',
    }
  } catch (error) {
    console.error('Error checking access:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      allowed: false,
      canProceed: false,
      currentUsage: 0,
      quota: 0,
      remaining: 0,
      error: message,
    }
  }
}
