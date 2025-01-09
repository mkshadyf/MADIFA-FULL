import React, { useEffect, useState } from 'react'
import { useOfflineContent } from '@/hooks/useOfflineContent'
import type { Content } from '@/types/content'

interface OfflineToggleProps {
  contentId: string
}

export default function OfflineToggle({ contentId }: OfflineToggleProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const {
    isAvailableOffline,
    isProcessing: checkProcessing,
    downloadForOffline,
    removeFromOffline,
  } = useOfflineContent()

  useEffect(() => {
    checkOfflineStatus()
  }, [contentId])

  const checkOfflineStatus = async () => {
    try {
      const [available, processing] = await Promise.all([
        isAvailableOffline(contentId),
        checkProcessing(contentId),
      ])
      setIsAvailable(available)
      setIsProcessing(processing)
    } catch (error) {
      console.error('Error checking offline status:', error)
    }
  }

  const handleToggle = async () => {
    try {
      setIsProcessing(true)
      if (isAvailable) {
        await removeFromOffline(contentId)
      } else {
        await downloadForOffline(contentId)
      }
      await checkOfflineStatus()
    } catch (error) {
      console.error('Error toggling offline status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {isProcessing ? (
        <span>Processing...</span>
      ) : isAvailable ? (
        <span>Remove from Offline</span>
      ) : (
        <span>Save for Offline</span>
      )}
    </button>
  )
}
