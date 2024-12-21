import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'

import type { VimeoVideo } from '@/types/vimeo'
import { Button } from '@/components/ui/button'

import { VideoPlayer } from '../video/VideoPlayer'
import { SecurityManager } from './SecurityManager'

interface VideoCardProps {
  video: VimeoVideo
  onDelete: (videoId: string) => Promise<void>
  onSecurityUpdate: (
    videoId: string,
    security: {
      view: 'disable' | 'nobody' | 'unlisted' | 'anybody'
      embed: 'private' | 'public'
      comments: 'nobody' | 'all'
      download: boolean
      add: boolean
    }
  ) => Promise<void>
  onThumbnailUpdate: (thumbnailUrl: string) => Promise<void>
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onDelete,
  onSecurityUpdate,
  onThumbnailUpdate,
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false)
  const [isUpdatingThumbnail, setIsUpdatingThumbnail] = useState(false)

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

  const handleSecurityUpdate = async (security: {
    view: 'disable' | 'nobody' | 'unlisted' | 'anybody'
    embed: 'private' | 'public'
    comments: 'nobody' | 'all'
    download: boolean
    add: boolean
  }) => {
    try {
      setIsUpdatingSecurity(true)
      await onSecurityUpdate(video.uri.split('/').pop()!, security)
    } catch (error) {
      console.error('Failed to update security:', error)
    } finally {
      setIsUpdatingSecurity(false)
    }
  }

  const handleThumbnailUpdate = async (url: string) => {
    try {
      setIsUpdatingThumbnail(true)
      await onThumbnailUpdate(url)
    } catch (error) {
      console.error('Failed to update thumbnail:', error)
    } finally {
      setIsUpdatingThumbnail(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="aspect-video">
        <VideoPlayer
          url={video.uri || ''}
          thumbnail={video.pictures?.base_link || ''}
          title={video.name || ''}
          controls={true}
          autoplay={false}
          loop={false}
          muted={false}
          quality="auto"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium">{video.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{video.description}</p>
        <div className="mt-4 flex justify-between gap-2">
          <Button onClick={() => setIsOpen(true)} variant="secondary" size="sm">
            Manage Security
          </Button>
          <Button
            onClick={() =>
              handleThumbnailUpdate(video.pictures?.base_link || '')
            }
            variant="secondary"
            size="sm"
            isLoading={isUpdatingThumbnail}
          >
            Update Thumbnail
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            size="sm"
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="flex min-h-full items-center justify-center">
            <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium">
                Security Settings
              </Dialog.Title>
              <SecurityManager
                videoId={video.uri.split('/').pop()!}
                currentSecurity={{
                  view:
                    video.privacy.view === 'password'
                      ? 'nobody'
                      : video.privacy.view === 'anybody'
                        ? 'anybody'
                        : video.privacy.view === 'unlisted'
                          ? 'unlisted'
                          : 'disable',
                  embed:
                    video.privacy.embed === 'public' ? 'public' : 'private',
                  comments: video.privacy.view === 'anybody' ? 'all' : 'nobody',
                  download: Boolean(video.privacy.embed),
                  add: Boolean(video.privacy), // to fix
                }}
                onUpdate={handleSecurityUpdate}
                loading={isUpdatingSecurity}
              />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
