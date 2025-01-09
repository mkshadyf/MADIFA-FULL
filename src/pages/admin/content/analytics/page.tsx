import UserActivityChart from '@/components/admin/Analytics/user-activity-chart'
import ContentStats from '@/components/admin/Content/content-stats'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import analytics from '../../analytics'

type Content = Database['public']['Tables']['content']['Row']

interface ContentAnalytics {
  id: string
  title: string
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
}
