import type { VimeoPrivacy } from '@/types/vimeo'
import { vimeoService } from './index'

export const getVideoDetails = (videoId: string) => vimeoService.getVideoDetails(videoId)
export const updateVideoPrivacy = (videoId: string, privacy: VimeoPrivacy) => vimeoService.updateVideoPrivacy(videoId, privacy)
export const getVideosByFolder = (folderId: string) => vimeoService.getVideosByFolder(folderId) 