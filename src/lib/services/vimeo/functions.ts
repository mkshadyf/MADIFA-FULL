import type { VimeoPrivacy, VimeoVideo } from '@/types/vimeo'
import { vimeoService } from './vimeo-service'

export const getVideoDetails = (videoId: string): Promise<VimeoVideo> => 
  vimeoService.getVideo(videoId)

export const updateVideoPrivacy = (videoId: string, privacy: VimeoPrivacy): Promise<boolean> => 
  vimeoService.updateVideoProperties(videoId, { privacy })

export const getVideosByFolder = (folderId: string): Promise<VimeoVideo[]> => 
  vimeoService.getVideosByFolder(folderId)