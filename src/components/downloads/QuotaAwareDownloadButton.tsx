import React, { useState } from 'react'
import type { Content } from '@/types'
import type { QuotaCheckResult } from '@/types/quota'
import { useQuotaEnforcement } from '@/hooks/useQuotaEnforcement'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { IconButton } from '../ui/button'
import type { SubscriptionService } from '@/lib/services/subscription'

interface QuotaAwareDownloadButtonProps {
  content: Content
  priority?: number
  className?: string
  onQuotaExceeded?: () => void
  subscriptionService: SubscriptionService
}

export default function QuotaAwareDownloadButton({
  content,
  priority = 0,
  className = '',
  onQuotaExceeded,
  subscriptionService,
}: QuotaAwareDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [quotaCheck, setQuotaCheck] = useState<QuotaCheckResult | null>(null)
  const quotaEnforcement = useQuotaEnforcement(subscriptionService)
  const { user } = useAuth()
  const { showToast } = useToast()

  const handleDownload = async () => {
    if (!user?.id) {
      showToast('Please sign in to download content', 'error')
      return
    }

    try {
      setIsLoading(true)
      const check = await quotaEnforcement.checkQuota(user.id, content.size)
      setQuotaCheck(check)
      
      if (!check || !check.allowed) {
        onQuotaExceeded?.()
        showToast(check?.error || 'Storage quota exceeded', 'error')
        return
      }

      await quotaEnforcement.updateUsage(content.size)
      showToast('Download started successfully', 'success')
    } catch (error) {
      console.error('Failed to start download:', error)
      showToast(
        error instanceof Error ? error.message : 'Failed to start download',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <IconButton
        label="Download content"
        icon={isLoading ? 'loader' : 'download'}
        onClick={handleDownload}
        disabled={isLoading}
        className={`${className} ${isLoading ? 'animate-spin' : ''}`}
        aria-label="Download content"
      />
      {quotaCheck?.isNearLimit && (
        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-yellow-500" />
      )}
    </div>
  )
}
