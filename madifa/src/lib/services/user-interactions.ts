import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/types/content'

interface UserInteraction {
  favorite?: boolean
  watchlist?: boolean
  rating?: number
}

export async function toggleFavorite(contentId: string, userId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get current state
    const { data: existing } = await supabase
      .from('user_content_interactions')
      .select('favorite')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .single()

    const newState = !existing?.favorite

    // Upsert the interaction
    const { error } = await supabase
      .from('user_content_interactions')
      .upsert({
        user_id: userId,
        content_id: contentId,
        favorite: newState,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return newState
  } catch (error) {
    console.error('Error toggling favorite:', error)
    throw error
  }
}

export async function toggleWatchlist(contentId: string, userId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get current state
    const { data: existing } = await supabase
      .from('user_content_interactions')
      .select('watchlist')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .single()

    const newState = !existing?.watchlist

    // Upsert the interaction
    const { error } = await supabase
      .from('user_content_interactions')
      .upsert({
        user_id: userId,
        content_id: contentId,
        watchlist: newState,
        updated_at: new Date().toISOString()
      })

    if (error) throw error

    return newState
  } catch (error) {
    console.error('Error toggling watchlist:', error)
    throw error
  }
}

export async function rateContent(
  contentId: string,
  userId: string,
  rating: number
): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('user_content_interactions')
      .upsert({
        user_id: userId,
        content_id: contentId,
        rating,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error rating content:', error)
    throw error
  }
}

export async function getUserFavorites(userId: string): Promise<Content[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_user_favorites', {
        p_user_id: userId
      })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting favorites:', error)
    throw error
  }
}

export async function getUserWatchlist(userId: string): Promise<Content[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_user_watchlist', {
        p_user_id: userId
      })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting watchlist:', error)
    throw error
  }
}

export async function getUserRatings(userId: string): Promise<{
  content_id: string
  title: string
  rating: number
  rated_at: string
}[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_user_ratings', {
        p_user_id: userId
      })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting ratings:', error)
    throw error
  }
}

export async function getContentInteractions(
  contentId: string,
  userId: string
): Promise<UserInteraction> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_content_interactions')
      .select('favorite, watchlist, rating')
      .eq('content_id', contentId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore not found error

    return {
      favorite: data?.favorite || false,
      watchlist: data?.watchlist || false,
      rating: data?.rating || 0
    }
  } catch (error) {
    console.error('Error getting content interactions:', error)
    throw error
  }
} 
