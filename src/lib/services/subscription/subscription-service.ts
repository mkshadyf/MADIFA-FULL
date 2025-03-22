import { createClient } from '@/lib/supabase/client'
import type {
  Invoice,
  PaymentMethod,
  QuotaCheckResult,
  SubscriptionPlan,
  SyncError,
  SyncJob,
  UserSubscription
} from '@/types/subscription'
import type { SubscriptionService as ISubscriptionService } from './types'
import { handleSubscriptionError } from './subscription-error-handler'
import { syncVimeoAccess } from './vimeo'
import { payFastService } from './payfast'

/**
 * Consolidated Subscription Service that handles all subscription related operations
 */
export class SubscriptionService implements ISubscriptionService {
  private supabase = createClient()

  /**
   * Get user subscription
   */
  async getSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      return data
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  /**
   * Get current active subscription for a user
   */
  async getCurrentSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const { data } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
      return data
    } catch (error) {
      console.error('Error fetching current subscription:', error)
      return null
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<{ redirectUrl: string }> {
    try {
      // Create PayFast payment URL
      const redirectUrl = await payFastService.createSubscriptionPayment(userId, plan)
      
      // Return the URL for redirection
      return { redirectUrl }
    } catch (error) {
      handleSubscriptionError(error as Error)
      throw error
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<UserSubscription | null> {
    try {
      // Cancel subscription via PayFast
      return await payFastService.cancelSubscription(subscriptionId)
    } catch (error) {
      handleSubscriptionError(error as Error)
      throw error
    }
  }

  /**
   * Update subscription details
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Partial<UserSubscription>
  ): Promise<UserSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating subscription:', error)
      return null
    }
  }

  /**
   * Get billing history for a user
   */
  async getBillingHistory(userId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await this.supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching billing history:', error)
      return []
    }
  }

  /**
   * Get payment methods for a user
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payments/methods?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }
      
      const data = await response.json()
      return data.paymentMethods || []
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return []
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    try {
      const response = await fetch('/api/payments/methods/default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, methodId }),
      })

      if (!response.ok) {
        throw new Error('Failed to set default payment method')
      }
    } catch (error) {
      console.error('Error setting default payment method:', error)
      throw error
    }
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(userId: string, methodId: string): Promise<void> {
    try {
      const response = await fetch(`/api/payments/methods/${methodId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete payment method')
      }
    } catch (error) {
      console.error('Error deleting payment method:', error)
      throw error
    }
  }

  /**
   * Get invoices for a user
   */
  async getInvoices(userId: string): Promise<Invoice[]> {
    try {
      const response = await fetch(`/api/payments/invoices?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      
      const data = await response.json()
      return data.invoices || []
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  }

  /**
   * Download an invoice
   */
  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/payments/invoices/${invoiceId}/download`)
      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }
      
      return await response.blob()
    } catch (error) {
      console.error('Error downloading invoice:', error)
      throw error
    }
  }

  /**
   * Check access for content
   */
  async checkAccess(userId: string, contentId: string): Promise<QuotaCheckResult> {
    try {
      const subscription = await this.getCurrentSubscription(userId)
      
      if (!subscription) {
        return {
          canProceed: false,
          currentUsage: 0,
          quota: 0,
          remaining: 0,
          allowed: false,
          message: 'No active subscription',
        }
      }
      
      // Use contentId to check specific content access if needed
      console.log(`Checking access for content: ${contentId}`)
      
      // Simple implementation - could be extended based on content type, etc.
      return {
        canProceed: true,
        currentUsage: 0,
        quota: 999999, // Would come from subscription tier
        remaining: 999999,
        allowed: true,
      }
    } catch (error) {
      console.error('Error checking access:', error)
      return {
        canProceed: false,
        currentUsage: 0,
        quota: 0,
        remaining: 0,
        allowed: false,
        error: 'Error checking access',
      }
    }
  }

  /**
   * Check quota before download
   */
  async checkQuotaBeforeDownload(
    userId: string,
    contentSize: number
  ): Promise<QuotaCheckResult> {
    try {
      const subscription = await this.getCurrentSubscription(userId)
      
      if (!subscription) {
        return {
          canProceed: false,
          currentUsage: 0,
          quota: 0,
          remaining: 0,
          allowed: false,
          message: 'No active subscription',
        }
      }
      
      // Get quota from subscription tier
      const quota = typeof subscription.metadata?.quota === 'number' 
        ? subscription.metadata.quota 
        : typeof subscription.metadata?.quota === 'string'
        ? parseInt(subscription.metadata.quota, 10)
        : 0
      
      // Get current usage
      const { data: usageData } = await this.supabase
        .from('usage')
        .select('downloads')
        .eq('user_id', userId)
        .single()
      
      const currentUsage = usageData?.downloads || 0
      const remaining = Math.max(0, quota - currentUsage)
      
      return {
        canProceed: remaining >= contentSize,
        currentUsage,
        quota,
        remaining,
        allowed: remaining >= contentSize,
        message: remaining < contentSize ? 'Not enough quota' : undefined,
      }
    } catch (error) {
      console.error('Error checking quota:', error)
      return {
        canProceed: false,
        currentUsage: 0,
        quota: 0,
        remaining: 0,
        allowed: false,
        error: 'Error checking quota',
      }
    }
  }

  /**
   * Start monitoring quota usage
   */
  async startQuotaMonitoring(userId: string): Promise<void> {
    try {
      // Implementation would depend on monitoring approach
      console.log(`Starting quota monitoring for user ${userId}`)
    } catch (error) {
      console.error('Error starting quota monitoring:', error)
    }
  }

  /**
   * Stop monitoring quota usage
   */
  async stopQuotaMonitoring(userId: string): Promise<void> {
    try {
      // Implementation would depend on monitoring approach
      console.log(`Stopping quota monitoring for user ${userId}`)
    } catch (error) {
      console.error('Error stopping quota monitoring:', error)
    }
  }

  /**
   * Update usage statistics
   */
  async updateUsage(userId: string, usage: number): Promise<void> {
    try {
      const { data: existingUsage } = await this.supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (existingUsage) {
        // Update existing usage
        await this.supabase
          .from('usage')
          .update({
            downloads: existingUsage.downloads + usage,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
      } else {
        // Create new usage record
        await this.supabase
          .from('usage')
          .insert({
            user_id: userId,
            downloads: usage,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
      }
    } catch (error) {
      console.error('Error updating usage:', error)
    }
  }

  /**
   * Sync all subscriptions (scheduled job)
   */
  async syncSubscriptions(): Promise<void> {
    try {
      // Get all active subscriptions
      const { data: subscriptions } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active')
      
      if (!subscriptions?.length) return
      
      // Process each subscription
      await Promise.all(
        subscriptions.map(async (subscription) => {
          try {
            await syncVimeoAccess(subscription)
          } catch (error) {
            console.error(`Error syncing subscription ${subscription.id}:`, error)
            
            // Log error
            await this.supabase
              .from('subscription_sync_errors')
              .insert({
                subscription_id: subscription.id,
                user_id: subscription.user_id,
                error_message: (error as Error).message,
                created_at: new Date().toISOString(),
              })
          }
        })
      )
    } catch (error) {
      console.error('Error syncing subscriptions:', error)
    }
  }

  /**
   * Get sync errors
   */
  async getSyncErrors(): Promise<SyncError[]> {
    try {
      const { data } = await this.supabase
        .from('subscription_sync_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      return data || []
    } catch (error) {
      console.error('Error fetching sync errors:', error)
      return []
    }
  }

  /**
   * Get sync jobs
   */
  async getSyncJobs(): Promise<SyncJob[]> {
    try {
      const { data } = await this.supabase
        .from('subscription_sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      return data || []
    } catch (error) {
      console.error('Error fetching sync jobs:', error)
      return []
    }
  }

  /**
   * Get subscription tiers/plans
   */
  async getSubscriptionTiers(): Promise<SubscriptionPlan[]> {
    try {
      const { data } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true })
      
      return data || []
    } catch (error) {
      console.error('Error fetching subscription tiers:', error)
      return []
    }
  }

  /**
   * Check if the subscription scheduler is running properly
   */
  async checkSchedulerHealth(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('scheduler_heartbeat')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        
      if (error) {
        console.error('Error checking scheduler health:', error)
        return false
      }
      
      if (!data) {
        return false
      }
      
      // Check if the last heartbeat was within the last 24 hours
      const lastHeartbeat = new Date(data.created_at)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      return lastHeartbeat > twentyFourHoursAgo
    } catch (error) {
      console.error('Error checking scheduler health:', error)
      return false
    }
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService()

// Export individual methods for convenience
export const {
  getSubscription,
  getCurrentSubscription,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getBillingHistory,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  getInvoices,
  downloadInvoice,
  checkAccess,
  checkQuotaBeforeDownload,
  startQuotaMonitoring,
  stopQuotaMonitoring,
  updateUsage,
  syncSubscriptions,
  getSyncErrors,
  getSyncJobs,
  getSubscriptionTiers,
  checkSchedulerHealth,
} = subscriptionService
