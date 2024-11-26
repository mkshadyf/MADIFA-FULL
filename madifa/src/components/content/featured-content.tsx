

import { useRouter } from 'react-router-dom'
import Image from 'react-router-dom'
import type { Content } from '@/lib/types/content'

interface FeaturedContentProps {
  content: Content
  className?: string
}

export default function FeaturedContent({ content, className = '' }: FeaturedContentProps) {
  const router = useRouter()

  return (
    <div className={`relative group ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={content.thumbnail_url}
          alt={content.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end">
        <div className="max-w-[2000px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
          <div className="max-w-2xl animate-slide-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              {content.title}
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {content.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push(`/watch/${content.id}`)}
                className="btn-primary px-8 py-4 text-lg"
              >
                <svg
                  className="w-6 h-6 mr-2"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Play Now
              </button>
              <button
                onClick={() => {/* Add to watchlist */}}
                className="btn-secondary px-8 py-4 text-lg"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                My List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
