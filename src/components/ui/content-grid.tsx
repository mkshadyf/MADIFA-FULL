import type { Content } from '@/types/content'
import { Link } from 'react-router-dom'

interface ContentGridProps {
  items: Content[]
  className?: string
  onItemClick?: (item: Content) => void
}

export function ContentGrid({
  items,
  className = '',
  onItemClick,
}: ContentGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {items.map(item => (
        <Link
          key={item.id}
          to={`/watch/${item.id}`}
          className="group relative overflow-hidden rounded-lg bg-gray-800 shadow-md transition-transform hover:scale-105"
          onClick={() => onItemClick?.(item)}
        >
          <div className="aspect-video w-full">
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <h3 className="mb-1 text-lg font-semibold text-white">
              {item.title}
            </h3>
            <p className="line-clamp-2 text-sm text-gray-300">
              {item.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
