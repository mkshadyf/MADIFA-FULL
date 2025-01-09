import { Dialog } from '@headlessui/react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import type {
  Content,
  ContentStatus,
  ContentVisibility,
  EncodingStatus,
} from '@/types/content'
import type { VimeoVideo } from '@/types/vimeo'

import VideoPlayer from '@/components/video/VideoPlayer'
import { SecurityManager } from './SecurityManager'

interface VideoCardProps {
  video: VimeoVideo
  onDelete: (videoId: string) => Promise<void>
  onSecurityUpdate: (
    videoId: string,
    updates: Partial<Content>
  ) => Promise<void>
  onThumbnailUpdate: (thumbnailUrl: string) => Promise<void>
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onDelete,
  onSecurityUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(video.uri.split('/').pop()!)
    } catch (error) {
      console.error('Failed to delete video:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSecurityUpdate = async (updates: Partial<Content>) => {
    try {
      setIsUpdatingSecurity(true)
      await onSecurityUpdate(video.uri.split('/').pop()!, updates)
    } catch (error) {
      console.error('Failed to update security:', error)
    } finally {
      setIsUpdatingSecurity(false)
    }
  }

  const videoId = video.uri.split('/').pop()!
  const fileSize = video.files?.[0]?.size || 0
  const content: Content = {
    id: videoId,
    title: video.name,
    description: video.description || '',
    video_url: video.link || '',
    thumbnail_url: video.pictures?.sizes?.[0]?.link || '',
    preview_url: video.pictures?.sizes?.[0]?.link || '',
    duration: video.duration || 0,
    category_id: 'uncategorized',
    category: 'uncategorized',
    tags: [],
    fileSize,
    size: fileSize,
    type: 'video',
    views: video.stats?.plays || 0,
    rating: null,
    created_at: video.created_time,
    updated_at: video.modified_time,
    vimeo_id: videoId,
    status: (video.status === 'available'
      ? 'published'
      : 'processing') as ContentStatus,
    content_type: 'video',
    owner_id: video.uri,
    visibility: (video.privacy?.view === 'anybody'
      ? 'public'
      : 'private') as ContentVisibility,
    encoding_status: (video.status === 'available'
      ? 'completed'
      : 'processing') as EncodingStatus,
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="aspect-video">
        <VideoPlayer
          content={content}
          onProgress={progress => {
            console.log('Video progress:', progress)
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{video.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{video.description}</p>
        <div className="mt-4 flex justify-between">
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            disabled={isUpdatingSecurity}
          >
            Security Settings
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="relative mx-auto max-w-md rounded-lg bg-white p-6">
            <SecurityManager
              content={content}
              onUpdate={handleSecurityUpdate}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
