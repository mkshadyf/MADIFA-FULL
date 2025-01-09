import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Content } from '@/types/content'

export interface BaseGridProps {
  items: Content[]
  title?: string
  aspectRatio?: 'video' | 'poster'
  showLoadMore?: boolean
  onLoadMore?: () => void
  isLoading?: boolean
  className?: string
  renderItem?: (content: Content) => React.ReactNode
  renderOverlay?: (content: Content) => React.ReactNode
  renderActions?: (content: Content) => React.ReactNode
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function BaseGrid({
  items,
  title,
  aspectRatio = 'video',
  showLoadMore = false,
  onLoadMore,
  isLoading = false,
  className = '',
  renderItem,
  renderOverlay,
  renderActions,
}: BaseGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const navigate = useNavigate()

  const defaultRenderItem = (content: Content) => (
    <div
      className={`relative ${
        aspectRatio === 'video' ? 'aspect-video' : 'aspect-[2/3]'
      } cursor-pointer overflow-hidden rounded-lg`}
      onClick={() => navigate(`/watch/${content.id}`)}
    >
      <img
        src={content.thumbnail_url || ''}
        alt={content.title}
        className="object-cover transition-transform duration-300 group-hover:scale-110"
      />

      {/* Default Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="line-clamp-1 font-medium text-white">
            {content.title}
          </h3>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-300">
            <span>{content.release_year}</span>
            {content.duration ? (
              <>
                <span>•</span>
                <span>{Math.floor(content.duration / 60)}m</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Default Play Button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          title="Play"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
        >
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          </svg>
        </button>
      </div>
    </div>
  )

  return (
    <section className={`space-y-4 ${className}`}>
      {title ? (
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      ) : null}

      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {items.map(content => (
          <motion.div
            key={content.id}
            variants={item}
            className="group relative"
            onMouseEnter={() => setHoveredId(content.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {renderItem ? renderItem(content) : defaultRenderItem(content)}
            {renderOverlay &&
              hoveredId === content.id &&
              renderOverlay(content)}
            {renderActions && renderActions(content)}
          </motion.div>
        ))}
      </motion.div>

      {showLoadMore && items.length > 0 ? (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="btn-secondary"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      ) : null}

      {items.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          No content available
        </div>
      )}
    </section>
  )
}
