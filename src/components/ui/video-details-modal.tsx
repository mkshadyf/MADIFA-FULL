import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import type { Database } from '@/lib/database.types'

type Content = Database['public']['Tables']['videos']['Row'] & {
  release_year: number
  category: string
}

interface VideoDetailsModalProps {
  content: Content
  onClose: () => void
  onPlay: () => void
}

export default function VideoDetailsModal({
  content,
  onClose,
  onPlay,
}: VideoDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        ref={modalRef}
        className="mx-4 w-full max-w-2xl rounded-lg bg-gray-900"
      >
        <div className="relative aspect-video">
          <img
            src={content.thumbnail_url ?? ''}
            alt={content.title}
            className="h-full w-full rounded-t-lg object-cover"
          />
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors hover:bg-black/60"
            aria-label="Play video"
          >
            <svg
              className="h-20 w-20 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <h2 className="mb-2 text-2xl font-bold text-white">
            {content.title}
          </h2>
          <p className="mb-4 text-gray-400">{content.description}</p>

          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{content.release_year}</span>
            <span>{content.category}</span>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              onClick={onPlay}
              className="flex-1 rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700"
            >
              Play
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-md bg-gray-800 py-2 text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
