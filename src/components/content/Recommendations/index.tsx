import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecommendations } from '@/hooks/useRecommendations'
import type { Content } from '@/types/content'
import BaseGrid, { type BaseGridProps } from '../Grid/BaseGrid'

type RecommendationsGridProps = Omit<
  BaseGridProps,
  'renderItem' | 'renderOverlay' | 'renderActions'
> & {
  showScore?: boolean
  showReason?: boolean
}

export default function RecommendationsGrid({
  showScore = true,
  showReason = true,
  ...props
}: RecommendationsGridProps) {
  const renderOverlay = (content: Content) => (
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {showScore && content.metadata?.score && (
          <span className="mb-2 inline-block rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
            {Math.round(content.metadata.score * 100)}% Match
          </span>
        )}
        <h3 className="line-clamp-2 text-lg font-medium text-white">
          {content.title}
        </h3>
        {showReason && content.metadata?.reason && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-300">
            {content.metadata.reason}
          </p>
        )}
        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-300">
          <span>{content.release_year}</span>
          {content.duration ? (
            <>
              <span>•</span>
              <span>{Math.floor(content.duration / 60)}m</span>
            </>
          ) : null}
          {content.rating ? (
            <>
              <span>•</span>
              <span>{content.rating}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )

  return (
    <BaseGrid
      {...props}
      renderOverlay={renderOverlay}
      className="recommendations-grid"
    />
  )
}
