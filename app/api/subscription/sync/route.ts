import { handleSyncError } from '@/lib/services/subscription-error-handler'
import { syncSubscriptionAccess } from '@/lib/services/subscription-sync'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  try {
    const { userId, subscriptionId } = await request.json()

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create sync job
    const { data: job, error: jobError } = await supabase
      .from('subscription_sync_jobs')
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (jobError) throw jobError

    try {
      // Attempt sync
      await syncSubscriptionAccess(userId)

      // Update job status
      await supabase
        .from('subscription_sync_jobs')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      return NextResponse.json({ success: true })
    } catch (syncError) {
      await handleSyncError(
        syncError instanceof Error ? syncError : new Error('Unknown error'),
        job.id,
        userId
      )
      throw syncError
    }
  } catch (error) {
    console.error('Error in sync endpoint:', error)
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    )
  }
} 