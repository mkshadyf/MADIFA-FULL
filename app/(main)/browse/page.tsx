'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ContentGrid from '@/components/ui/content-grid'
import FeaturedContent from '@/components/content/featured-content'
import CategorySlider from '@/components/content/category-slider'
import Loading from '@/components/ui/loading'
import type { Content } from '@/lib/types/content'

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
        console.error('Error loading content:', error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Featured Content Hero */}
      {featured && (
        <FeaturedContent content={featured} className="h-[80vh] mb-8" />
      )}

      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-12">
        {/* Categories Slider */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Browse Categories</h2>
          <CategorySlider />
        </section>

        {/* Trending Now */}
        {trending.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Trending Now</h2>
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
            <h2 className="text-2xl font-bold text-white mb-6">New Releases</h2>
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