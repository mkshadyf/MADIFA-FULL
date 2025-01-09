import type { Content } from '@/types/content'
import BaseGrid, { type BaseGridProps } from '../Grid/BaseGrid'

type CategoryBrowserProps = Omit<
  BaseGridProps,
  'renderItem' | 'renderOverlay' | 'renderActions'
> & {
  showCategories?: boolean
  showTags?: boolean
}

export default function CategoryBrowser({
  showCategories = true,
  showTags = true,
  ...props
}: CategoryBrowserProps) {
  const renderOverlay = (content: Content) => (
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="line-clamp-2 text-lg font-medium text-white">
          {content.title}
        </h3>
        {showCategories &&
          content.metadata?.categories &&
          content.metadata.categories.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {content.metadata.categories.map(category => (
                <span
                  key={category}
                  className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        {showTags && content.tags && content.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {content.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-gray-700 px-2 py-1 text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
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
      className="category-browser"
    />
  )
}
