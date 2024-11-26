import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '../../../lib/supabase/client'
import type { Database } from '../../../lib/supabase/database.types'

type AdminStats = Database['public']['Tables']['admin_stats']['Row']

export default function AdminDashboard() {
  const supabase = createClient()
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_stats')
        .select('*')
        .single()

      if (error) throw error
      return data
    }
  })

  return (
    <div>
      {/* Render your dashboard */}
    </div>
  )
} 