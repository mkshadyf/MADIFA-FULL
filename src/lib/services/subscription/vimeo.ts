import { vimeoClient } from '@/lib/services/vimeo/vimeo-client'
import type { UserSubscription } from '@/types/subscription'
import type { VimeoVideo } from '@/types/vimeo'

export async function getVimeoAccess(subscription: UserSubscription): Promise<{
  canAccess: boolean
  maxQuality: string
}> {
  try {
    // Check if subscription is active
    if (subscription.status !== 'active') {
      return { canAccess: false, maxQuality: '360p' }
    }

    // Get quality limits based on subscription tier
    const qualityLimits = {
      free: '360p',
      premium: '1080p',
      premium_plus: '4K',
    }

    const maxQuality =
      qualityLimits[subscription.tier as keyof typeof qualityLimits] || '360p'

    // Verify access with Vimeo
    const response = await vimeoClient.request<VimeoVideo>({
      method: 'GET',
      path: '/me',
      query: {
        fields: 'account_type',
      },
    })

    return {
      canAccess: response.data.length > 0,
      maxQuality,
    }
  } catch (error) {
    console.error('Error checking Vimeo access:', error)
    return { canAccess: false, maxQuality: '360p' }
  }
}

export async function syncVimeoAccess(
  subscription: UserSubscription
): Promise<void> {
  try {
    const { canAccess, maxQuality } = await getVimeoAccess(subscription)

    if (!canAccess) {
      // Revoke access if subscription is not active
      await vimeoClient.request({
        method: 'PUT',
        path: '/me/access',
        query: {
          type: 'none',
        },
      })
    } else {
      // Update access based on subscription tier
      await vimeoClient.request({
        method: 'PUT',
        path: '/me/access',
        query: {
          type: 'limited',
          max_quality: maxQuality,
        },
      })
    }
  } catch (error) {
    console.error('Error syncing Vimeo access:', error)
    throw error
  }
}
