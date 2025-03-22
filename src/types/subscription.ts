export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  // PayFast specific statuses
  | 'complete'
  | 'pending'
  | 'cancelled'

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus'
export type SubscriptionInterval = 'month' | 'year'
export type SubscriptionTierType = 'individual' | 'team' | 'enterprise'
export type BillingPeriod = 'monthly' | 'yearly'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  metadata?: {
    stripePriceId?: string
    stripeProductId?: string
    payFastProductId?: string
    tier?: string
    quota?: number
    maxDownloads?: number
    maxStorage?: number
    [key: string]: string | number | boolean | undefined
  }
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  payfast_reference?: string
  payfast_token?: string
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  ended_at?: string
  trial_start?: string
  trial_end?: string
  metadata?: Record<string, string | number | boolean | null | undefined>
  tier?: SubscriptionTier
  plan?: SubscriptionPlan
  usage?: {
    downloads: number
    storage: number
    streams: number
  }
  billing_period?: BillingPeriod
  end_date?: string
}

export interface BillingHistory {
  id: string
  user_id: string
  type: 'charge' | 'refund' | 'adjustment'
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  created_at: string
  metadata?: Record<string, string | number | boolean | null | undefined>
}

export interface SubscriptionError extends Error {
  name: string
  code: string
  message: string
  originalError?: Error
  details?: {
    subscription_id?: string
    user_id?: string
    plan_id?: string
    error_code?: string
    error_message?: string
  }
}

export interface SubscriptionSyncJob {
  id: string
  user_id: string
  subscription_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  retry_count: number
  next_retry_at?: string
  error_message?: string
  created_at: string
  processed_at?: string
  last_sync_at?: string
  sync_type?: 'manual' | 'automatic'
  priority?: number
}

export interface SubscriptionSyncError {
  id: string
  job_id: string
  user_id: string
  error_message: string
  error_stack?: string
  created_at: string
  resolved_at?: string
  resolution?: string
  severity?: 'low' | 'medium' | 'high'
}

export interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    exp_month: number
    exp_year: number
    last4: string
  }
  isDefault: boolean
}

export interface Invoice {
  id: string
  subscription_id: string
  user_id: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  created: string
  due_date: string
  paid_at?: string
  invoice_pdf?: string
  receipt_pdf?: string
  receipt_url?: string
  lines: {
    description: string
    amount: number
    period: {
      start: string
      end: string
    }
  }[]
}

export interface QuotaCheckResult {
  canProceed: boolean
  currentUsage: number
  quota: number
  remaining: number
  message?: string
  allowed: boolean
  error?: string
}

export interface SyncError {
  id: string
  error_message: string
  error_code: string
  created_at: string
  subscription_id?: string
  details?: Record<string, string | number | boolean | null | undefined>
}

export interface SyncJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  error?: string
  details?: Record<string, string | number | boolean | null | undefined>
}
