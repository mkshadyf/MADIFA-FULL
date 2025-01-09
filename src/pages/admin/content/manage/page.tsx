import type { Content } from '@/types/content'
import { useEffect, useState } from 'react'
import fetchMetrics from '../manage/page'

import ContentCategories from '@/components/admin/Content/content-categories'
import ContentList from '@/components/admin/Content/content-list'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface DbContent {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  preview_url: string | null
  duration: number | null
  category_id: string
  category: string
  file_size: number
  content_type: 'video' | 'audio' | 'document' | 'image'
  created_at: string
  updated_at: string
  views: number
  rating: number | null
  tags: string[]
  user_id: string
  status: 'draft' | 'published' | 'archived' | 'processing' | 'ready' | 'inactive'
  visibility: 'public' | 'private' | 'unlisted'
  monetization: {
    type: 'free' | 'premium' | 'pay_per_view'
    price?: number
    currency?: string
  }
}

interface Metrics {
  totalContent: number
  activeContent: number
  totalViews: number
  averageRating: number
  storageUsed: number
  categoryDistribution: Record<string, number>
  popularContent: DbContent[]
}

const transformToContent = (item: DbContent): Content => ({
  id: item.id,
  title: item.title,
  description: item.description || '',
  thumbnail_url: item.thumbnail_url || '',
  preview_url: item.preview_url || '',
  duration: item.duration || 0,
  category_id: item.category_id,
  category: item.category,
  fileSize: item.file_size,
  type: item.content_type,
  created_at: item.created_at,
  updated_at: item.updated_at,
  views: item.views,
  rating: item.rating,
  size: item.file_size,
  tags: item.tags,
  owner_id: item.user_id,
  content_type: item.content_type,
  status: item.status,
  visibility: item.visibility,
  monetization: item.monetization
})

export default function ContentManagement() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true)
        const data = await fetchMetrics()
        setMetrics(data as unknown as Metrics)
      } catch (error) {
        console.error('Error loading metrics:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMetrics()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold text-white">Content Management</h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="text-lg font-semibold text-gray-300">Total Content</h3>
            <p className="text-2xl font-bold text-white">{metrics?.totalContent}</p>
          </div>
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="text-lg font-semibold text-gray-300">Total Views</h3>
            <p className="text-2xl font-bold text-white">{metrics?.totalViews}</p>
          </div>
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="text-lg font-semibold text-gray-300">Average Rating</h3>
            <p className="text-2xl font-bold text-white">
              {metrics?.averageRating.toFixed(1)}
            </p>
          </div>
          <div className="rounded-lg bg-gray-800 p-4">
            <h3 className="text-lg font-semibold text-gray-300">Storage Used</h3>
            <p className="text-2xl font-bold text-white">
              {(metrics?.storageUsed || 0).toFixed(2)} GB
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-white">Categories</h2>
        {metrics && <ContentCategories distribution={metrics.categoryDistribution} />}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Content List</h2>
          <input
            type="text"
            placeholder="Search content..."
            className="rounded-lg bg-gray-700 px-4 py-2 text-white"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <ContentList
          content={metrics?.popularContent?.map(transformToContent) || []}
          onRefresh={async () => {
            try {
              setLoading(true)
              const data = await fetchMetrics()
              setMetrics(data as unknown as Metrics)
            } catch (error) {
              console.error('Error refreshing metrics:', error)
            } finally {
              setLoading(false)
            }
          }}
        />
      </div>
    </div>
  )
}
