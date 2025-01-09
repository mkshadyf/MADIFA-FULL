import { createClient } from '@/lib/supabase/server'
import type { QuotaCheckResult } from '@/types/subscription'

export async function checkQuotaBeforeDownload(
  userId: string,
  contentSize: number
): Promise<QuotaCheckResult> {
  try {
    const supabase = await createClient()
    const { data: quota } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!quota) {
      throw new Error('No quota found for user')
    }

    const newUsage = quota.current_usage + contentSize
    const canProceed = newUsage <= quota.limit
    const allowed = canProceed

    return {
      allowed,
      canProceed,
      currentUsage: quota.current_usage,
      quota: quota.limit,
      remaining: quota.limit - quota.current_usage,
      error: canProceed ? undefined : 'Quota exceeded',
    }
  } catch (error) {
    console.error('Error checking quota:', error)
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

export async function startQuotaMonitoring(userId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('user_quotas').upsert({
      user_id: userId,
      monitoring_active: true,
      last_checked: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error starting quota monitoring:', error)
    throw error
  }
}

export async function stopQuotaMonitoring(userId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('user_quotas')
      .update({ monitoring_active: false })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error stopping quota monitoring:', error)
    throw error
  }
}

export async function updateUsage(
  userId: string,
  usage: number
): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase
      .from('user_quotas')
      .update({ current_usage: usage })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error updating usage:', error)
    throw error
  }
}
