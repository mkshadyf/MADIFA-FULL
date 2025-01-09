import type { SubscriptionStatus, SubscriptionTier } from '@/types/auth'
import type {
  Content,
  Database,
  Functions,
  Tables,
  UserProfile,
  Views,
} from '../database.types'

export type WatchHistory = {
  id: string
  user_id: string
  video_id: string
  watched_at: string
  progress: number
  completed: boolean
}

export type UserSubscriptionView = {
  user_id: string
  subscription_id: string
  status: SubscriptionStatus
  tier: SubscriptionTier
  current_period_end: string
}

export type ActiveSubscriptionView = {
  user_id: string
  subscription_id: string
  tier: SubscriptionTier
  days_remaining: number
}

export type { Content, Database, Functions, Tables, UserProfile, Views }
