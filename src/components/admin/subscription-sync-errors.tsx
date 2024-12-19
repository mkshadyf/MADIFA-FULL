import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

interface ErrorLog {
  id: string
  job_id: string
  error_message: string
  stack_trace?: string
  created_at: string
}

export default function SubscriptionSyncErrors() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadErrors()
    const interval = setInterval(loadErrors, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setErrors(data)
    } catch (error) {
      logger.error('Error loading errors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent Errors</h2>
      <div className="overflow-hidden rounded-lg bg-gray-800">
        {errors.map(error => (
          <div
            key={error.id}
            className="border-b border-gray-700 p-4 last:border-0"
          >
            <div className="mb-2 flex items-start justify-between">
              <p className="font-medium text-red-400">{error.error_message}</p>
              <span className="text-sm text-gray-400">
                {new Date(error.created_at).toLocaleString()}
              </span>
            </div>
            {error.stack_trace ? (
              <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-2 text-sm text-gray-300">
                {error.stack_trace}
              </pre>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
