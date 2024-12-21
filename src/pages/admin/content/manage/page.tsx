import { useEffect, useState } from 'react'
import { fetchMetrics } from '../manage/page'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'
import ContentCategories from '@/components/admin/content-categories'
import ContentList from '@/components/admin/content-list'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type Content = Database['public']['Tables']['content']['Row']

interface ContentMetrics {
  totalContent: number
  totalViews: number
  averageRating: number
  storageUsed: number
  categoryDistribution: {
    [key: string]: number
  }
  popularContent: Content[]
}

export default function ContentManagement() {
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Get total content
        const { count: totalContent } = await supabase
          .from('content')
          .select('*', { count: 'exact' })

        // Get total views
        const { count: totalViews } = await supabase
          .from('viewing_history')
          .select('*', { count: 'exact' })

        // Get category distribution
        const { data: categories } = await supabase
          .from('content')
          .select('category')

        const categoryDistribution =
          categories?.reduce(
            (acc, item) => {
              acc[item.category] = (acc[item.category] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          ) || {}

        // Get popular content
        const { data: popularContent } = await supabase
          .from('content')
          .select('*, viewing_history(count)')
          .order('viewing_history(count)', { ascending: false })
          .limit(5)

        setMetrics({
          totalContent: totalContent || 0,
          totalViews: totalViews || 0,
          averageRating: 4.5, // TODO: Implement ratings system
          storageUsed: 0, // TODO: Implement storage metrics
          categoryDistribution,
          popularContent: popularContent || [],
        })
      } catch (error) {
        console.error('Error fetching content metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white"
          />
          <select
            title="Select a category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white"
          >
            <option value="all">All Categories</option>
            {Object.keys(metrics?.categoryDistribution || {}).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Content</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.totalContent}
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.totalViews}
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {metrics?.averageRating}
          </p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-sm font-medium text-gray-400">Storage Used</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {(metrics?.storageUsed || 0) / 1024 / 1024 / 1024} GB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">
            Category Distribution
          </h2>
          <ContentCategories />
        </div>
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">Popular Content</h2>
          <div className="overflow-hidden rounded-lg bg-gray-800">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 bg-gray-800">
                {metrics?.popularContent.map(content => (
                  <tr key={content.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                      {content.title}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {/* Add view count here */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-white">Content List</h2>
        <ContentList
          content={metrics?.popularContent || []}
          onRefresh={() => {
            setLoading(true)
            void fetchMetrics().catch((error: any) => {
              console.error('Error refreshing metrics:', error)
              setLoading(false)
            })
          }}
        />
      </div>
    </div>
  )
}
