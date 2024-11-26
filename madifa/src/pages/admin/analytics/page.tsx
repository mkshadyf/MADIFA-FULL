

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Loading from '@/components/ui/loading'

interface ViewingStats {
  date: string
  count: number
}

interface CategoryStats {
  category: string
  count: number
}

export default function AdminAnalytics() {
  const [viewingStats, setViewingStats] = useState<ViewingStats[]>([])
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch viewing stats for the last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: viewings } = await supabase
          .from('viewing_history')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())

        // Group viewings by date
        const viewingsByDate = (viewings || []).reduce((acc: Record<string, number>, viewing) => {
          const date = new Date(viewing.created_at).toLocaleDateString()
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

        setViewingStats(
          Object.entries(viewingsByDate).map(([date, count]) => ({
            date,
            count,
          }))
        )

        // Fetch category stats
        const { data: categories } = await supabase
          .from('content')
          .select('category')

        // Group content by category
        const categoryCounts = (categories || []).reduce((acc: Record<string, number>, content) => {
          acc[content.category] = (acc[content.category] || 0) + 1
          return acc
        }, {})

        setCategoryStats(
          Object.entries(categoryCounts).map(([category, count]) => ({
            category,
            count,
          }))
        )
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Views by Date</h2>
          <div className="space-y-2">
            {viewingStats.map((stat) => (
              <div
                key={stat.date}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-300">{stat.date}</span>
                <span className="text-white font-medium">{stat.count} views</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Content by Category</h2>
          <div className="space-y-2">
            {categoryStats.map((stat) => (
              <div
                key={stat.category}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-300">{stat.category}</span>
                <span className="text-white font-medium">{stat.count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add more analytics sections here */}
    </div>
  )
} 
