import { createClient } from '@/lib/supabase/client'

export interface Ad {
  id: string
  title: string
  description: string
  media_url: string
  target_url: string
  format: 'pre-roll' | 'mid-roll' | 'banner'
  duration?: number
  start_date: string
  end_date: string
  targeting: {
    regions?: string[]
    age_groups?: string[]
    interests?: string[]
    excluded_categories?: string[]
  }
}

export interface AdPlacement {
  content_id: string
  ad_id: string
  position: number // Seconds for video ads, pixel position for banners
  viewed: boolean
  completed: boolean
  interaction?: 'click' | 'skip' | 'complete'
}

export async function getAdsForContent(
  contentId: string,
  userId: string
): Promise<Ad[]> {
  const supabase = createClient()

  try {
    // Get user profile for targeting
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier, preferences, region')
      .eq('user_id', userId)
      .single()

    // Don't show ads for premium users
    if (profile?.subscription_tier !== 'free') {
      return []
    }

    // Get relevant ads
    const { data: ads } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('priority', { ascending: false })
    // Filter ads based on targeting
    return filterAdsByTargeting(ads ?? [], profile)
  } catch (error) {
    console.error('Error getting ads:', error)
    return []
  }
}


export async function trackAdImpression(
  adId: string,
  userId: string,
  interaction: 'view' | 'click' | 'skip' | 'complete'
) {
  const supabase = createClient()

  try {
    await supabase.from('ad_analytics').insert({
      ad_id: adId,
      user_id: userId,
      interaction,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error tracking ad impression:', error)
  }
}

// Helper function to filter ads based on targeting criteria
function filterAdsByTargeting(ads: any[], profile: any) {
  return ads.filter(ad => {
    // Check region targeting
    if (ad.target_regions?.length && !ad.target_regions.includes(profile.region)) {
      return false
    }

    // Check preference targeting
    if (ad.target_preferences?.length) {
      const hasMatchingPreference = ad.target_preferences.some((pref: string) =>
        profile.preferences?.includes(pref)
      )
      if (!hasMatchingPreference) return false
    }

    return true
  })
}

// Get ad performance metrics
export async function getAdMetrics(adId: string, startDate: string, endDate: string) {
  const supabase = createClient()

  try {
    const { data: metrics } = await supabase
      .from('ad_analytics')
      .select('interaction, count')
      .eq('ad_id', adId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)

    return {
      views: metrics?.find(m => m.interaction === 'view')?.count || 0,
      clicks: metrics?.find(m => m.interaction === 'click')?.count || 0,
      skips: metrics?.find(m => m.interaction === 'skip')?.count || 0,
      completes: metrics?.find(m => m.interaction === 'complete')?.count || 0
    }
  } catch (error) {
    console.error('Error getting ad metrics:', error)
    return null
  }
}

// Update ad status
export async function updateAdStatus(adId: string, status: 'active' | 'paused' | 'ended') {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('ads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', adId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating ad status:', error)
    return false
  }
}

// Create new ad campaign
export async function createAdCampaign({
  title,
  description,
  mediaUrl,
  targetRegions,
  targetPreferences,
  startDate,
  endDate,
  priority,
  budget
}: {
  title: string
  description: string
  mediaUrl: string
  targetRegions?: string[]
  targetPreferences?: string[]
  startDate: string
  endDate: string
  priority: number
  budget: number
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from('ads').insert({
      title,
      description,
      media_url: mediaUrl,
      target_regions: targetRegions,
      target_preferences: targetPreferences,
      start_date: startDate,
      end_date: endDate,
      priority,
      budget,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating ad campaign:', error)
    return null
  }
}

// Get user ad preferences
export async function getUserAdPreferences(userId: string) {
  const supabase = createClient()

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('ad_preferences, ad_opt_out')
      .eq('user_id', userId)
      .single()

    return {
      preferences: profile?.ad_preferences || [],
      optOut: profile?.ad_opt_out || false
    }
  } catch (error) {
    console.error('Error getting user ad preferences:', error)
    return null
  }
}

// Update user ad preferences
export async function updateUserAdPreferences(
  userId: string,
  preferences: string[],
  optOut: boolean
) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ad_preferences: preferences,
        ad_opt_out: optOut,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating user ad preferences:', error)
    return false
  }
}

// Get ad budget usage
export async function getAdBudgetUsage(adId: string) {
  const supabase = createClient()

  try {
    const { data: ad } = await supabase
      .from('ads')
      .select('budget, used_budget')
      .eq('id', adId)
      .single()

    if (!ad) return null

    return {
      total: ad.budget,
      used: ad.used_budget || 0,
      remaining: ad.budget - (ad.used_budget || 0)
    }
  } catch (error) {
    console.error('Error getting ad budget usage:', error)
    return null
  }
}
