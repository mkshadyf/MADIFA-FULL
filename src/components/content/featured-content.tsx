import Image, { useRouter } from 'react-router-dom'

import type { Content } from '@/lib/types/content'

interface FeaturedContentProps {
  content: Content
  className?: string
}

export default function FeaturedContent({
  content,
  className = '',
}: FeaturedContentProps) {
  const router = useRouter()

  return (
    <div className={`group relative ${className}`}>
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
      <div className="relative flex h-full items-end">
        <div className="mx-auto w-full max-w-[2000px] px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
          <div className="animate-slide-up max-w-2xl">
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
              {content.title}
            </h1>
            <p className="mb-8 text-lg text-gray-300">{content.description}</p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push(`/watch/${content.id}`)}
                className="btn-primary px-8 py-4 text-lg"
              >
                <svg
                  className="mr-2 h-6 w-6"
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
                onClick={() => {
                  /* Add to watchlist */
                }}
                className="btn-secondary px-8 py-4 text-lg"
              >
                <svg
                  className="mr-2 h-6 w-6"
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
