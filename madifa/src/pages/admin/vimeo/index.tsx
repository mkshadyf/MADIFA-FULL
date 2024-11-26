import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '../../../lib/supabase/client'

export default function VimeoManagement() {
  const supabase = createClient()
  const { data: vimeoContent } = useQuery({
    queryKey: ['vimeoContent'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vimeo_content')
        .select('*')
        .order('created_at', { ascending: false })
      return data
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Vimeo Management</h1>
      {/* Add your vimeo management content here */}
    </div>
  )
} 