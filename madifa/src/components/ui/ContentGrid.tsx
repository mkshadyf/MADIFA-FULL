import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Content } from '@/lib/supabase/database.types'
import { useContentAccess } from '@/hooks/useContentAccess'

interface ContentGridProps {
  content: Content[]
}

export default function ContentGrid({ content }: ContentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {content.map((item) => (
        <ContentCard key={item.id} content={item} />
      ))}
    </div>
  )
}

function ContentCard({ content }: { content: Content }) {
  const { hasAccess } = useContentAccess(content.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="relative group"
    >
      <Link to={hasAccess ? `/watch/${content.id}` : `/subscribe`}>
        <div className="aspect-video rounded-lg overflow-hidden">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 p-4">
              <h3 className="text-white font-semibold">{content.title}</h3>
              <p className="text-gray-300 text-sm line-clamp-2">
                {content.description}
              </p>
              {!hasAccess && (
                <span className="inline-block mt-2 px-2 py-1 bg-indigo-600 text-white text-xs rounded">
                  Subscribe to Watch
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
} 