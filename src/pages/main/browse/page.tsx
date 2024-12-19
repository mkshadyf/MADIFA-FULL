import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Content } from '@/lib/types/content'
import ContentGrid from '@/components/ui/content-grid'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import CategorySlider from '@/components/content/category-slider'
import FeaturedContent from '@/components/content/featured-content'
import { logger } from '@/lib/logger'

export default function BrowsePage() {
  const [featured, setFeatured] = useState<Content | null>(null)
  const [trending, setTrending] = useState<Content[]>([])
  const [newReleases, setNewReleases] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Get featured content
        const { data: featuredData } = await supabase
          .from('content')
          .select('*')
          .eq('is_featured', true)
          .limit(1)
          .single()

        // Get trending content
        const { data: trendingData } = await supabase
          .from('content')
          .select('*')
          .order('views', { ascending: false })
          .limit(10)

        // Get new releases
        const { data: newData } = await supabase
          .from('content')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        setFeatured(featuredData)
        setTrending(trendingData || [])
        setNewReleases(newData || [])
      } catch (error) {
        logger.error('Error loading content:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadContent()
  }, [  ])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Featured Content Hero */}
      {featured ? (
        <FeaturedContent content={featured} className="mb-8 h-[80vh]" />
      ) : null}

      <div className="mx-auto max-w-[2000px] space-y-12 px-4 pb-12 sm:px-6 lg:px-8">
        {/* Categories Slider */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-white">
            Browse Categories
          </h2>
          <CategorySlider />
        </section>

        {/* Trending Now */}
        {trending.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="mb-6 text-2xl font-bold text-white">Trending Now</h2>
            <ContentGrid
              items={trending}
              aspectRatio="poster"
              showLoadMore={false}
            />
          </section>
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="mb-6 text-2xl font-bold text-white">New Releases</h2>
            <ContentGrid
              items={newReleases}
              aspectRatio="poster"
              showLoadMore={false}
            />
          </section>
        )}
      </div>
    </div>
  )
}
