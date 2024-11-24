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
    return filterAdsByTargeting(ads, profile)
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
    await supabase
      .from('ad_analytics')
      .insert({
        ad_id: adId,
        user_id: userId,
        interaction,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error tracking ad impression:', error)
  }
}

// ... (about 200 more lines of advertising code) 