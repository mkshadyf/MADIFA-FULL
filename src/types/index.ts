export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastState {
  id: string
  type: ToastType
  message: string
  duration?: number
  position?: 'top' | 'bottom'
  onClose?: () => void
}

// Export specific types to avoid ambiguity
export * from './auth'
export * from './content'
export * from './downloads'
export { type QueueItemWithStats } from './queue'
export {
  type BillingHistory,
  type BillingPeriod,
  type SubscriptionStatus as SubStatus,
  type SubscriptionTier as SubTier,
  type SubscriptionError,
  type SubscriptionInterval,
  type SubscriptionPlan,
  type SubscriptionTierType,
  type UserSubscription,
} from './subscription'
export * from './vimeo'
