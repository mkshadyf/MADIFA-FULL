'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SyncStats {
  totalJobs: number
  pendingJobs: number
  failedJobs: number
  completedJobs: number
  averageProcessingTime: number
}

export default function SubscriptionSyncMonitor() {
  const [stats, setStats] = useState<SyncStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      // Get job counts
      const { data: counts, error: countError } = await supabase
        .from('subscription_sync_jobs')
        .select('status', { count: 'exact' })
        .in('status', ['pending', 'completed', 'failed'])
        .order('status')

      if (countError) throw countError

      // Calculate average processing time
      const { data: avgTime, error: timeError } = await supabase
        .from('subscription_sync_jobs')
        .select('created_at, processed_at')
        .eq('status', 'completed')
        .limit(100)

      if (timeError) throw timeError

      const avgProcessingTime = avgTime.reduce((acc, job) => {
        const start = new Date(job.created_at).getTime()
        const end = new Date(job.processed_at!).getTime()
        return acc + (end - start)
      }, 0) / avgTime.length

      setStats({
        totalJobs: counts.length,
        pendingJobs: counts.filter(c => c.status === 'pending').length,
        failedJobs: counts.filter(c => c.status === 'failed').length,
        completedJobs: counts.filter(c => c.status === 'completed').length,
        averageProcessingTime: avgProcessingTime / 1000 // Convert to seconds
      })
    } catch (error) {
      console.error('Error loading sync stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!stats) return <div>Error loading stats</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Total Jobs</h3>
          <p className="text-3xl font-bold text-white">{stats.totalJobs}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Pending</h3>
          <p className="text-3xl font-bold text-yellow-400">{stats.pendingJobs}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Failed</h3>
          <p className="text-3xl font-bold text-red-400">{stats.failedJobs}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Completed</h3>
          <p className="text-3xl font-bold text-green-400">{stats.completedJobs}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-300">Avg. Processing Time</h3>
          <p className="text-3xl font-bold text-white">
            {stats.averageProcessingTime.toFixed(2)}s
          </p>
        </div>
      </div>
    </div>
  )
} 