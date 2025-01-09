import type { Content } from '@/types/content'

interface FeaturedContentProps {
  content: Content
  className?: string
}

export default function FeaturedContent({
  content,
  className = '',
}: FeaturedContentProps) {
  if (!content) {
    return null
  }

  return (
    <div className={className}>
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white">Featured Content</h2>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={content.thumbnail_url}
            alt={content.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-4xl font-bold text-white">{content.title}</h1>
              <p className="mt-2 text-lg text-gray-200">
                {content.description}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
