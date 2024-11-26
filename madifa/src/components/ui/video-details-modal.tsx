

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Content } from '@/lib/supabase/database.types'

interface VideoDetailsModalProps {
  content: Content
  onClose: () => void
  onPlay: () => void
}

export default function VideoDetailsModal({ content, onClose, onPlay }: VideoDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-gray-900 rounded-lg max-w-2xl w-full mx-4">
        <div className="relative aspect-video">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
          <button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
          >
            <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{content.title}</h2>
          <p className="text-gray-400 mb-4">{content.description}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>{content.release_year}</span>
            <span>{content.category}</span>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onPlay}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Play
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
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
