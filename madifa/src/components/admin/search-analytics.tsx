

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Line } from 'react-chartjs-2'

interface SearchStats {
  totalSearches: number
  averageResults: number
  popularQueries: { query: string; count: number }[]
  searchesByDay: { date: string; count: number }[]
  noResultQueries: { query: string; count: number }[]
}

export default function SearchAnalytics() {
  const [stats, setStats] = useState<SearchStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d')
  const supabase = createClient()

  useEffect(() => {
    const fetchSearchStats = async () => {
      try {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(dateRange))

        // Get total searches and average results
        const { data: totals } = await supabase
          .from('search_analytics')
          .select('results_count')
          .gte('created_at', startDate.toISOString())

        const totalSearches = totals?.length || 0
        const averageResults = totals?.reduce((acc, curr) => acc + curr.results_count, 0) / totalSearches || 0

        // Get popular queries
        const { data: popularQueries } = await supabase
          .from('search_analytics')
          .select('query, count(*)')
          .gte('created_at', startDate.toISOString())
          .group('query')
          .order('count', { ascending: false })
          .limit(10)

        // Get searches by day
        const { data: searchesByDay } = await supabase
          .from('search_analytics')
          .select('created_at, count(*)')
          .gte('created_at', startDate.toISOString())
          .group('created_at')
          .order('created_at')

        // Get queries with no results
        const { data: noResultQueries } = await supabase
          .from('search_analytics')
          .select('query, count(*)')
          .eq('results_count', 0)
          .gte('created_at', startDate.toISOString())
          .group('query')
          .order('count', { ascending: false })
          .limit(10)

        setStats({
          totalSearches,
          averageResults,
          popularQueries: popularQueries?.map(q => ({
            query: q.query,
            count: parseInt(q.count)
          })) || [],
          searchesByDay: searchesByDay?.map(d => ({
            date: new Date(d.created_at).toLocaleDateString(),
            count: parseInt(d.count)
          })) || [],
          noResultQueries: noResultQueries?.map(q => ({
            query: q.query,
            count: parseInt(q.count)
          })) || []
        })
      } catch (error) {
        console.error('Error fetching search stats:', error)
        setError(error instanceof Error ? error.message : 'Failed to load search analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchSearchStats()
  }, [dateRange])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-800 rounded-lg mb-6"></div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-48 bg-gray-800 rounded-lg"></div>
          <div className="h-48 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end space-x-2">
        {['7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range as '7d' | '30d' | '90d')}
            className={`px-3 py-1 rounded-md text-sm ${
              dateRange === range
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white">Total Searches</h3>
          <p className="text-3xl font-bold text-indigo-500 mt-2">
            {stats.totalSearches.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white">Average Results</h3>
          <p className="text-3xl font-bold text-indigo-500 mt-2">
            {stats.averageResults.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Search Trend Chart */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Search Trends</h3>
        <Line
          data={{
            labels: stats.searchesByDay.map(d => d.date),
            datasets: [{
              label: 'Searches',
              data: stats.searchesByDay.map(d => d.count),
              borderColor: 'rgb(99, 102, 241)',
              tension: 0.1
            }]
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: 'white' }
              },
              x: {
                ticks: { color: 'white' }
              }
            },
            plugins: {
              legend: {
                labels: { color: 'white' }
              }
            }
          }}
        />
      </div>

      {/* Popular Queries */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Popular Searches</h3>
          <div className="space-y-2">
            {stats.popularQueries.map((query, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{query.query}</span>
                <span className="text-indigo-400">{query.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">No Results Queries</h3>
          <div className="space-y-2">
            {stats.noResultQueries.map((query, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">{query.query}</span>
                <span className="text-red-400">{query.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 
