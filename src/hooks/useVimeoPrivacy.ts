import { updateVideoPrivacy } from '@/lib/services/vimeo'
import type { VimeoPrivacy } from '@/types/vimeo'
import { useState } from 'react'

export function useVimeoPrivacy() {
  const [updating, setUpdating] = useState(false)

  const togglePrivacy = async (videoId: string, makePublic: boolean) => {
    try {
      setUpdating(true)
      const privacy: VimeoPrivacy = {
        view: makePublic ? 'anybody' : 'disable',
        embed: makePublic ? 'public' : 'private',
        download: false,
        comments: 'nobody'
      }
      await updateVideoPrivacy(videoId, privacy)
    } catch (error) {
      console.error('Error updating video privacy:', error)
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
