import type { Content } from '@/types/content'
import { Modal } from './modal'

interface VideoDetailsModalProps {
  video?: Content | null
  content?: Content | null
  isOpen: boolean
  onClose: () => void
}

export default function VideoDetailsModal({
  video,
  content,
  isOpen,
  onClose,
}: VideoDetailsModalProps) {
  const videoContent = video || content
  if (!videoContent) return null

  const releaseDate = videoContent.metadata?.release_date
    ? new Date(videoContent.metadata.release_date).toLocaleDateString()
    : 'Release date not available'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={videoContent.title}
      description={`Released: ${releaseDate}`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={videoContent.thumbnail_url || ''}
            alt={videoContent.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Duration: {formatDuration(videoContent.metadata?.duration || 0)}
          </p>
          <p className="text-sm text-gray-500">
            Views: {formatNumber(videoContent.metadata?.views || 0)}
          </p>
          <p className="text-sm text-gray-500">
            Likes: {formatNumber(videoContent.metadata?.likes || 0)}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Description</h3>
          <p className="text-sm text-gray-500">{videoContent.description}</p>
        </div>

        {videoContent.metadata?.categories &&
          videoContent.metadata.categories.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {videoContent.metadata.categories.map((category: string) => (
                  <span
                    key={category}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

        {videoContent.metadata?.tags &&
          videoContent.metadata.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {videoContent.metadata.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>
    </Modal>
  )
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}
