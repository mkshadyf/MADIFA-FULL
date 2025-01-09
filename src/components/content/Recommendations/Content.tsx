import { ContentGrid } from '@/components/ui/content-grid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useRecommendations } from '@/hooks/useRecommendations'

interface RecommendedContentProps {
  limit?: number
  title?: string
}

export default function RecommendedContent({
  limit = 10,
  title = 'Recommended for You',
}: RecommendedContentProps) {
  const {
    data: recommendations,
    isLoading,
    error,
  } = useRecommendations({
    limit,
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !recommendations) {
    return null
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <ContentGrid items={recommendations} />
    </section>
  )
}
