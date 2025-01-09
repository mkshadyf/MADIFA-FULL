import type { Content } from '@/types/content'
import BaseGrid, { type BaseGridProps } from '../Grid/BaseGrid'

type FeaturedContentProps = Omit<
  BaseGridProps,
  'renderItem' | 'renderOverlay' | 'renderActions'
> & {
  showBadge?: boolean
  badgeText?: string
}

export default function FeaturedContent({
  showBadge = true,
  badgeText = 'Featured',
  ...props
}: FeaturedContentProps) {
  const renderOverlay = (content: Content) => (
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {showBadge && (
          <span className="mb-2 inline-block rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
            {badgeText}
          </span>
        )}
        <h3 className="line-clamp-2 text-lg font-medium text-white">
          {content.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-300">
          {content.description}
        </p>
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
      className="featured-content"
    />
  )
}
