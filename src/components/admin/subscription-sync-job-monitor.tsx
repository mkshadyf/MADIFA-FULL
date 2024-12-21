import React from "react"
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

 interface SyncJob {
  id: string
  user_id: string
  subscription_id: string
  status: 'pending' | 'completed' | 'failed'
  error_message?: string
  retry_count: number
  created_at: string
  processed_at?: string
}

export default function SubscriptionSyncJobMonitor() {
  const [jobs, setJobs] = useState<SyncJob[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    void loadJobs()
    const interval = setInterval(loadJobs, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_sync_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setJobs(data)
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const retryJob = async (jobId: string) => {
    try {
      await supabase
        .from('subscription_sync_jobs')
        .update({
          status: 'pending',
          error_message: null,
          retry_count: 0,
        })
        .eq('id', jobId)

      await loadJobs()
    } catch (error) {
      console.error('Error retrying job:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent Sync Jobs</h2>
      <div className="overflow-hidden rounded-lg bg-gray-800">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Retries
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {jobs.map(job => (
              <tr key={job.id}>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      job.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {job.user_id}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {new Date(job.created_at).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {job.retry_count}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {job.status === 'failed' && (
                    <button
                      onClick={() => retryJob(job.id)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
