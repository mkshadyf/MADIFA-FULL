import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Content } from '@/types/content'
import type { UserInteraction } from '@/types/supabase'
import type { UserProfile } from '@/types/auth'

/**
 * Service for managing user data and interactions
 */
export interface ProfileForm {
  full_name: string
  avatar_url?: string
  pin_code?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  email_notifications: boolean
  autoplay: boolean
  default_quality: '480p' | '720p' | '1080p'
  subtitle_language?: string
  audio_language?: string
  content_restrictions?: {
    max_rating?: string
    restricted_categories?: string[]
  }
}

interface UserInteractionWithContent extends UserInteraction {
  content?: Content
}

/**
 * User Service - handles all user-related operations
 */
class UserService {
  private static instance: UserService
  private supabase = createClient()
  
  private constructor() {}
  
  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  // ==================== Profile Management ====================
  
  /**
   * Get user profile from the database
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  /**
   * Update a user profile
   */
  public async updateProfile(userId: string, data: ProfileForm): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update(data)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  /**
   * Delete a user profile
   */
  public async deleteUserProfile(userId: string): Promise<void> {
    try {
      const supabase = await createServerClient()
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting user profile:', error)
      throw error
    }
  }

  // ==================== User Preferences ====================

  /**
   * Get user preferences
   */
  public async getUserPreferences(userId: string): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return data?.preferences || {}
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      throw error
    }
  }

  /**
   * Update user preferences
   */
  public async updateUserPreferences(
    userId: string,
    preferences: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating user preferences:', error)
      throw error
    }
  }

  // ==================== Content Interactions ====================

  /**
   * Toggle favorite status for content
   */
  public async toggleFavorite(
    contentId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Get current state
      const { data: existing } = await this.supabase
        .from('user_content_interactions')
        .select('favorite')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .single()

      const newState = !existing?.favorite

      // Upsert the interaction
      const { error } = await this.supabase.from('user_content_interactions').upsert({
        user_id: userId,
        content_id: contentId,
        favorite: newState,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      return newState
    } catch (error) {
      console.error('Error toggling favorite:', error)
      throw error
    }
  }

  /**
   * Toggle watchlist status for content
   */
  public async toggleWatchlist(
    contentId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Get current state
      const { data: existing } = await this.supabase
        .from('user_content_interactions')
        .select('watchlist')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .single()

      const newState = !existing?.watchlist

      // Upsert the interaction
      const { error } = await this.supabase.from('user_content_interactions').upsert({
        user_id: userId,
        content_id: contentId,
        watchlist: newState,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      return newState
    } catch (error) {
      console.error('Error toggling watchlist:', error)
      throw error
    }
  }

  /**
   * Rate content
   */
  public async rateContent(
    contentId: string,
    userId: string,
    rating: number
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('user_content_interactions').upsert({
        user_id: userId,
        content_id: contentId,
        rating,
        rated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error('Error rating content:', error)
      throw error
    }
  }

  /**
   * Get user favorites
   */
  public async getUserFavorites(userId: string): Promise<Content[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_interactions')
        .select('*, content(*)')
        .eq('user_id', userId)
        .eq('type', 'favorite')
        .returns<UserInteractionWithContent[]>()

      if (error) throw error
      return data?.filter(item => item.content).map(item => item.content!) || []
    } catch (error) {
      console.error('Error fetching user favorites:', error)
      throw error
    }
  }

  /**
   * Get user watchlist
   */
  public async getUserWatchlist(userId: string): Promise<Content[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_interactions')
        .select('*, content(*)')
        .eq('user_id', userId)
        .eq('type', 'watchlist')
        .returns<UserInteractionWithContent[]>()

      if (error) throw error
      return data?.filter(item => item.content).map(item => item.content!) || []
    } catch (error) {
      console.error('Error fetching user watchlist:', error)
      throw error
    }
  }

  /**
   * Get user ratings
   */
  public async getUserRatings(userId: string): Promise<
    {
      content_id: string
      title: string
      rating: number
      rated_at: string
    }[]
  > {
    try {
      const { data, error } = await this.supabase
        .from('user_ratings')
        .select('content_id, title, rating, rated_at')
        .eq('user_id', userId)
        .order('rated_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user ratings:', error)
      throw error
    }
  }

  /**
   * Get content interactions for a user
   */
  public async getContentInteractions(
    contentId: string,
    userId: string
  ): Promise<{ favorite?: boolean; watchlist?: boolean; rating?: number }> {
    try {
      const { data, error } = await this.supabase
        .from('user_content_interactions')
        .select('favorite, watchlist, rating')
        .eq('content_id', contentId)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore not found error
      
      return data || { favorite: false, watchlist: false }
    } catch (error) {
      console.error('Error fetching content interactions:', error)
      throw error
    }
  }

  // ==================== Watch History ====================

  /**
   * Record watch history
   */
  public async recordWatchHistory(
    userId: string,
    contentId: string,
    progress: number,
    duration: number
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from('watch_history').upsert({
        user_id: userId,
        content_id: contentId,
        progress,
        duration,
        last_watched: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error('Error recording watch history:', error)
      throw error
    }
  }

  /**
   * Get watch history
   */
  public async getWatchHistory(userId: string): Promise<Content[]> {
    try {
      const { data, error } = await this.supabase
        .from('watch_history')
        .select('*, content(*)')
        .eq('user_id', userId)
        .order('last_watched', { ascending: false })
        .returns<{ content: Content }[]>()

      if (error) throw error
      return data?.map(item => item.content) || []
    } catch (error) {
      console.error('Error fetching watch history:', error)
      throw error
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance()

// Export functions to maintain backward compatibility
export const {
  getUserProfile,
  updateProfile,
  deleteUserProfile,
  getUserPreferences,
  updateUserPreferences,
  toggleFavorite,
  toggleWatchlist,
  rateContent,
  getUserFavorites,
  getUserWatchlist,
  getUserRatings,
  getContentInteractions,
  recordWatchHistory,
  getWatchHistory
} = userService
