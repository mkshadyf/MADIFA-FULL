import type { Plan } from '@/lib/config/subscription-plans'
import { createClient } from '@/lib/supabase/client'
import { updateVideoPrivacy } from './vimeo'

export async function handleSubscriptionAccess(
  userId: string,
  plan: Plan,
  action: 'grant' | 'revoke'
) {
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
      content.map(async (item) => {
        // If granting access, make video public for subscriber
        // If revoking, make private unless user has another active subscription
        await updateVideoPrivacy(
          item.vimeo_id,
          action === 'grant'
        )
      })
    )

    // Log access change
    await supabase
      .from('subscription_logs')
      .insert({
        user_id: userId,
        plan_id: plan.id,
        action,
        timestamp: new Date().toISOString()
      })

  } catch (error) {
    console.error('Error handling subscription access:', error)
    throw error
  }
} 