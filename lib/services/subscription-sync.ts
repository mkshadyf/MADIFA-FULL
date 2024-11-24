import { createClient } from '@/lib/supabase/client'
import { getSubscriptionStatus } from './subscription'
import { updateVideosPrivacy } from './vimeo'

export async function syncSubscriptionAccess(userId: string) {
  const supabase = createClient()

  try {
    // Get user's subscription status
    const subscription = await getSubscriptionStatus(userId)
    const isActive = subscription?.status === 'active'

    // Get all content IDs
    const { data: content } = await supabase
      .from('content')
      .select('vimeo_id')
      .eq('is_published', true)

    if (!content?.length) return

    // Update Vimeo privacy settings
    await updateVideosPrivacy(
      content.map(item => item.vimeo_id),
      isActive
    )

    // Log sync
    await supabase
      .from('subscription_sync_log')
      .insert({
        user_id: userId,
        subscription_id: subscription?.id,
        status: isActive ? 'granted' : 'revoked',
        synced_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('Error syncing subscription access:', error)
    throw error
  }
}

// Add subscription sync table
export const subscriptionSyncMigration = `
CREATE TABLE IF NOT EXISTS subscription_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  status TEXT CHECK (status IN ('granted', 'revoked')),
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_subscription_sync_user ON subscription_sync_log(user_id);
CREATE INDEX idx_subscription_sync_status ON subscription_sync_log(status);
` 