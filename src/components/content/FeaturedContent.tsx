import React from "react"
import { useQuery } from '@tanstack/react-query'

import { contentService } from '@/lib/services/content'
import ContentGrid from '@/components/ui/ContentGrid'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function FeaturedContent() {
  const { data: featuredContent, isLoading } = useQuery({
    queryKey: ['featured-content'],
    queryFn: () => contentService.getFeaturedContent(),
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!featuredContent?.length) {
    return null
  }
 
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white">Featured Content</h2>
      <ContentGrid content={featuredContent} />
    </section>
  )
}
