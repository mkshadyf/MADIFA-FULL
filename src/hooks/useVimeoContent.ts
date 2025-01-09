import type { VimeoService, VimeoVideo } from '@/types/vimeo'
import { useCallback } from 'react'
import { useToast } from './useToast'

export function useVimeoContent(vimeoService: VimeoService) {
  const toast = useToast()

  const getVideo = useCallback(
    async (videoId: string): Promise<VimeoVideo | null> => {
      try {
        return await vimeoService.getVideo(videoId)
      } catch (error) {
        toast.error('Failed to fetch video details')
        return null
      }
    },
    [vimeoService, toast]
  )

  const deleteVideo = useCallback(
    async (videoId: string): Promise<boolean> => {
      try {
        await vimeoService.deleteVideo(videoId)
        toast.success('Video deleted successfully')
        return true
      } catch (error) {
        toast.error('Failed to delete video')
        return false
      }
    },
    [vimeoService, toast]
  )

  const getVideos = useCallback(
    async (options?: {
      page?: number
      per_page?: number
    }): Promise<VimeoVideo[]> => {
      try {
        return await vimeoService.getVideos(options)
      } catch (error) {
        toast.error('Failed to fetch videos')
        return []
      }
    },
    [vimeoService, toast]
  )

  return {
    getVideo,
    deleteVideo,
    getVideos,
    uploadVideo: vimeoService.uploadVideo,
    createFolder: vimeoService.createFolder,
    updateVideoMetadata: vimeoService.updateVideoMetadata,
    updateVideoPrivacy: vimeoService.updateVideoPrivacy,
    getVideoDetails: vimeoService.getVideoDetails,
    uploadThumbnail: vimeoService.uploadThumbnail,
    generateThumbnail: vimeoService.generateThumbnail,
    updateVideo: vimeoService.updateVideo,
    createShowcase: vimeoService.createShowcase,
    addToShowcase: vimeoService.addToShowcase,
    getVideosByFolder: vimeoService.getVideosByFolder,
    getAllVideos: vimeoService.getAllVideos,
    getFolders: vimeoService.getFolders,
  }
}
