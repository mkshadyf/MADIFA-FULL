'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SyncJob {
  id: string
  subscription_id: string
  user_id: string
  action: 'grant' | 'revoke'
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  processed_at?: string
}

export default function SubscriptionSyncStatus() {
  const [jobs, setJobs] = useState<SyncJob[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadJobs()
    const interval = setInterval(loadJobs, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setJobs(data)
    } catch (error) {
      console.error('Error loading sync jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium text-white">Sync Status</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-300">
          Recent subscription sync jobs and their status
        </p>
      </div>
      <div className="border-t border-gray-700">
        <ul role="list" className="divide-y divide-gray-700">
          {jobs.map((job) => (
            <li key={job.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white truncate">
                    {job.subscription_id}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(job.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              </div>
              {job.error_message && (
                <p className="mt-2 text-sm text-red-400">
                  {job.error_message}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 