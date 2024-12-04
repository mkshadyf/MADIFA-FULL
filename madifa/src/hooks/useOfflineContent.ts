import { contentService } from '@/lib/services/content'
import { useEffect, useState } from 'react'
import { useToast } from './useToast'

export function useOfflineContent(contentId: string) {
  const [isAvailableOffline, setIsAvailableOffline] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const toast = useToast()

  useEffect(() => {
    checkOfflineAvailability()
  }, [contentId])

  const checkOfflineAvailability = async () => {
    try {
      const isAvailable = await contentService.isAvailableOffline(contentId)
      setIsAvailableOffline(isAvailable)
    } catch (error) {
      console.error('Error checking offline availability:', error)
    }
  }

  const downloadForOffline = async () => {
    try {
      setIsProcessing(true)
      await contentService.markForOffline(contentId)
      setIsAvailableOffline(true)
      toast.success('Content saved for offline viewing')
    } catch (error) {
      toast.error('Failed to save content offline')
      console.error('Error downloading content:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFromOffline = async () => {
    try {
      setIsProcessing(true)
      await contentService.removeFromOffline(contentId)
      setIsAvailableOffline(false)
      toast.success('Content removed from offline storage')
    } catch (error) {
      toast.error('Failed to remove offline content')
      console.error('Error removing offline content:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isAvailableOffline,
    isProcessing,
    downloadForOffline,
    removeFromOffline
  }
} 