import type { Content } from '@/types'
import { useState } from 'react'

import { useAuth } from '@/hooks/useAuth'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useToast } from '@/hooks/useToast'

import { IconButton } from '@/components/ui'

interface DownloadButtonProps {
  content: Content
  priority?: number
  className?: string
}

export default function DownloadButton({
  className = '',
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  useDownloadQueue()
  const { user } = useAuth()
  const { showToast } = useToast()

  const handleDownload = async () => {
    if (!user) {
      showToast('Please sign in to download content', 'error')
      return
    }

    try {
      setIsLoading(true)
      //await addToQueue(content)
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
    <IconButton
      label="Download content"
      icon={isLoading ? 'loader' : 'download'}
      onClick={handleDownload}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'animate-spin' : ''}`}
      aria-label="Download content"
    />
  )
}
