'use client'

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
      console.error('Error loading errors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent Errors</h2>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {errors.map((error) => (
          <div
            key={error.id}
            className="p-4 border-b border-gray-700 last:border-0"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-red-400 font-medium">{error.error_message}</p>
              <span className="text-sm text-gray-400">
                {new Date(error.created_at).toLocaleString()}
              </span>
            </div>
            {error.stack_trace && (
              <pre className="mt-2 p-2 bg-gray-900 rounded text-sm text-gray-300 overflow-x-auto">
                {error.stack_trace}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 