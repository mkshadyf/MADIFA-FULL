import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import type { Content } from '@/lib/database.types'
import { useContentAccess } from '@/hooks/useContentAccess'

interface ContentGridProps {
  content: Content[]
}

export default function ContentGrid({ content }: ContentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {content.map(item => (
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
      className="group relative"
    >
      <Link to={hasAccess ? `/watch/${content.id}` : `/subscribe`}>
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <div className="absolute bottom-0 p-4">
              <h3 className="font-semibold text-white">{content.title}</h3>
              <p className="line-clamp-2 text-sm text-gray-300">
                {content.description}
              </p>
              {!hasAccess && (
                <span className="mt-2 inline-block rounded bg-indigo-600 px-2 py-1 text-xs text-white">
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
