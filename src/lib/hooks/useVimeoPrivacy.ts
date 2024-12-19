import { useState } from 'react'

import { updateVideoPrivacy } from '@/lib/services/vimeo'

export function useVimeoPrivacy() {
  const [updating, setUpdating] = useState(false)

  const togglePrivacy = async (videoId: string, makePublic: boolean) => {
    try {
      setUpdating(true)
      await updateVideoPrivacy(videoId, makePublic)
    } catch (error) {
      logger.error('Error updating video privacy:', error)
      throw error
    } finally {
      setUpdating(false)
    }
  }

  return {
    updating,
    togglePrivacy,
  }
}
