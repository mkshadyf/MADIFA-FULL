

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SyncMetrics {
  totalJobs: number
  pendingJobs: number
  failedJobs: number
  completedJobs: number
  averageProcessingTime: number
  retryRate: number
}

export default function SubscriptionSyncDashboard() {
  const [metrics, setMetrics] = useState<SyncMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadMetrics = async () => {
    try {
      // Get job metrics
      const { data: jobs, error } = await supabase
        .from('subscription_sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      // Calculate metrics
      const metrics: SyncMetrics = {
        totalJobs: jobs.length,
        pendingJobs: jobs.filter(j => j.status === 'pending').length,
        failedJobs: jobs.filter(j => j.status === 'failed').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length,
        averageProcessingTime: calculateAverageProcessingTime(jobs),
        retryRate: calculateRetryRate(jobs)
      }

      setMetrics(metrics)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageProcessingTime = (jobs: any[]): number => {
    const completedJobs = jobs.filter(j => j.status === 'completed' && j.processed_at)
    if (!completedJobs.length) return 0

    const totalTime = completedJobs.reduce((acc, job) => {
      const start = new Date(job.created_at).getTime()
      const end = new Date(job.processed_at).getTime()
      return acc + (end - start)
    }, 0)

    return totalTime / completedJobs.length / 1000 // Convert to seconds
  }

  const calculateRetryRate = (jobs: any[]): number => {
    const jobsWithRetries = jobs.filter(j => j.retry_count > 0)
    return (jobsWithRetries.length / jobs.length) * 100
  }

  if (loading) return <div>Loading...</div>
  if (!metrics) return <div>Error loading metrics</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Jobs"
          value={metrics.totalJobs}
          className="bg-gray-800"
        />
        <MetricCard
          title="Pending"
          value={metrics.pendingJobs}
          className="bg-yellow-800"
        />
        <MetricCard
          title="Failed"
          value={metrics.failedJobs}
          className="bg-red-800"
        />
        <MetricCard
          title="Completed"
          value={metrics.completedJobs}
          className="bg-green-800"
        />
        <MetricCard
          title="Avg. Processing Time"
          value={`${metrics.averageProcessingTime.toFixed(2)}s`}
          className="bg-blue-800"
        />
        <MetricCard
          title="Retry Rate"
          value={`${metrics.retryRate.toFixed(1)}%`}
          className="bg-purple-800"
        />
      </div>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  className 
}: { 
  title: string
  value: string | number
  className?: string 
}) {
  return (
    <div className={`p-4 rounded-lg ${className}`}>
      <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
} 
