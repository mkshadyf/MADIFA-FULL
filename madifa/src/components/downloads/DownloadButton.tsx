import React, { useState } from 'react'
import { IconButton } from '../ui/button'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import type { Content } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'

interface DownloadButtonProps {
  content: Content
  priority?: number
  className?: string
}

export default function DownloadButton({ 
  content, 
  priority = 0,
  className = ''
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addToQueue } = useDownloadQueue()
  const { user } = useAuth()
  const { showToast } = useToast()

  const handleDownload = async () => {
    if (!user) {
      showToast('Please sign in to download content', 'error')
      return
    }

    try {
      setIsLoading(true)
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
    <IconButton
      icon={isLoading ? 'loader' : 'download'}
      onClick={handleDownload}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'animate-spin' : ''}`}
      aria-label="Download content"
    />
  )
} 