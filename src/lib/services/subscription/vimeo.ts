import { vimeoService } from '@/lib/services/vimeo/vimeo-service'
import type { UserSubscription } from '@/types/subscription'

/**
 * Determines Vimeo access rights based on subscription status and tier
 */
export async function getVimeoAccess(subscription: UserSubscription): Promise<{
  canAccess: boolean
  maxQuality: string
}> {
  try {
    // Default access level for free users
    const defaultAccess = {
      canAccess: false,
      maxQuality: 'none'
    }

    // If no subscription or not active, return default access
    if (!subscription || subscription.status !== 'active') {
      return defaultAccess
    }

    // Determine access based on subscription tier
    switch (subscription.tier) {
      case 'premium':
        return { canAccess: true, maxQuality: '720p' }
      case 'premium_plus':
        return { canAccess: true, maxQuality: '1080p' }
      default:
        return defaultAccess
    }
  } catch (error) {
    console.error('Error determining Vimeo access:', error)
    return { canAccess: false, maxQuality: 'none' }
  }
}

/**
 * Syncs subscription status with Vimeo access rights
 */
export async function syncVimeoAccess(subscription: UserSubscription): Promise<void> {
  try {
    if (!subscription) {
      console.warn('No subscription provided for sync')
      return
    }

    const access = await getVimeoAccess(subscription)
    
    // Update Vimeo access rights based on subscription tier
    await vimeoService.updateAccessRights({
      userId: subscription.user_id,
      canAccess: access.canAccess,
      maxQuality: access.maxQuality,
      tier: subscription.tier
    })
    
    console.log(`Vimeo access synced for user ${subscription.user_id}`)
  } catch (error) {
    console.error('Failed to sync Vimeo access:', error)
  }
}
