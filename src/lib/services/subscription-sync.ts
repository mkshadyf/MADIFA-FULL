import { createAPIError } from '@/lib/error'
import { createClient } from '@/lib/supabase/client'
import { subscriptionService } from './subscription'
import { updateVideoPrivacy } from './vimeo'

interface SyncLogEntry {
  user_id: string
  subscription_id?: string
  status: 'granted' | 'revoked'
  synced_at: string
}

export async function syncSubscriptionAccess(userId: string): Promise<void> {
  const supabase = createClient()

  try {
    // Get full subscription details
    const subscription =
      await subscriptionService.getCurrentSubscription(userId)
    const subscriptionStatus =
      await subscriptionService.getSubscriptionStatus(userId)
    const isActive = subscriptionStatus === 'active'

    // Get all published content IDs
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('vimeo_id')
      .eq('is_published', true)

    if (contentError) {
      throw createAPIError(
        500,
        'Failed to fetch content',
        'CONTENT_FETCH_ERROR',
        contentError
      )
    }

    if (!content?.length) return

    // Update Vimeo privacy settings
    try {
      await updateVideoPrivacy(
        content.map(item => item.vimeo_id).filter(Boolean)[0],
        isActive
      )
    } catch (error) {
      throw createAPIError(
        500,
        'Failed to update video privacy',
        'PRIVACY_UPDATE_ERROR',
        error
      )
    }

    // Prepare sync log entry
    const logEntry: SyncLogEntry = {
      user_id: userId,
      subscription_id: subscription?.id,
      status: isActive ? 'granted' : 'revoked',
      synced_at: new Date().toISOString(),
    }

    // Log sync
    const { error: logError } = await supabase
      .from('subscription_sync_log')
      .insert(logEntry)

    if (logError) {
      throw createAPIError(
        500,
        'Failed to log sync',
        'SYNC_LOG_ERROR',
        logError
      )
    }
  } catch (error) {
    console.error('Error syncing subscription access:', error)
    throw createAPIError(
      500,
      'Failed to sync subscription access',
      'SYNC_ACCESS_ERROR',
      error
    )
  }
}

// Add subscription sync table with better constraints and indices
export const subscriptionSyncMigration = `
CREATE TABLE IF NOT EXISTS subscription_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('granted', 'revoked')),
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  
  -- Add constraint to ensure synced_at is not in future
  CONSTRAINT sync_log_valid_date CHECK (synced_at <= TIMEZONE('utc', NOW()))
);

-- Improve index coverage for common queries
CREATE INDEX idx_subscription_sync_user_date ON subscription_sync_log(user_id, synced_at DESC);
CREATE INDEX idx_subscription_sync_status_date ON subscription_sync_log(status, synced_at DESC);
CREATE INDEX idx_subscription_sync_subscription ON subscription_sync_log(subscription_id);

-- Add comment for documentation
COMMENT ON TABLE subscription_sync_log IS 'Tracks history of subscription access sync operations';
`
