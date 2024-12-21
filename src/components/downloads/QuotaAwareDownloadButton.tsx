import React, { useState } from 'react'
import type { Content } from '@/types'

import { formatBytes } from '@/lib/utils/format'
import { useAuth } from '@/hooks/useAuth'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useQuotaEnforcement } from '@/hooks/useQuotaEnforcement'
import { useStorageQuota } from '@/hooks/useStorageQuota'
import { useToast } from '@/hooks/useToast'

import { IconButton } from '../ui/button'


interface QuotaAwareDownloadButtonProps {
  content: Content
  priority?: number
  className?: string
  onQuotaExceeded?: () => void
}

export default function QuotaAwareDownloadButton({
  content,
  priority = 0,
  className = '',
  onQuotaExceeded,
}: QuotaAwareDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addToQueue } = useDownloadQueue()
  const { checkQuotaBeforeDownload } = useQuotaEnforcement()
  const { quotaStats } = useStorageQuota()
  const { user } = useAuth()
  const { showToast } = useToast()

  const handleDownload = async () => {
    if (!user) {
      showToast('Please sign in to download content', 'error')
      return
    }

    try {
      setIsLoading(true)

      // Check quota before starting download
      const canDownload = await checkQuotaBeforeDownload(content)
      if (!canDownload) {
        onQuotaExceeded?.()
        showToast(
          `Storage quota exceeded (${formatBytes(quotaStats.used)}/${formatBytes(quotaStats.quota)})`,
          'error'
        )
        return
      }

      await addToQueue(content, priority)
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
      {quotaStats.isNearLimit ? (
        <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-yellow-500" />
      ) : null}
    </div>
  )
}
