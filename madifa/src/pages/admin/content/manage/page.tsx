

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'
import ContentList from '@/components/admin/content-list'
import ContentCategories from '@/components/admin/content-categories'
import type { Database } from '@/lib/supabase/database.types'

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

        const categoryDistribution = categories?.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1
          return acc
        }, {} as Record<string, number>) || {}

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
          popularContent: popularContent || []
        })
      } catch (error) {
        console.error('Error fetching content metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Content Management</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="all">All Categories</option>
            {Object.keys(metrics?.categoryDistribution || {}).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Content</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.totalContent}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.totalViews}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
          <p className="mt-2 text-3xl font-bold text-white">{metrics?.averageRating}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Storage Used</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {(metrics?.storageUsed || 0) / 1024 / 1024 / 1024} GB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Category Distribution</h2>
          <ContentCategories />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Popular Content</h2>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Views
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {metrics?.popularContent.map((content) => (
                  <tr key={content.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {content.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
        <h2 className="text-xl font-bold text-white mb-4">Content List</h2>
        <ContentList
          content={metrics?.popularContent || []}
          onRefresh={() => {
            setLoading(true)
            fetchMetrics()
          }}
        />
      </div>
    </div>
  )
} 
