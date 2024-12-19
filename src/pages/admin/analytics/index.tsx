import type { ReactElement } from 'react'

import { AdminLayout } from '@/components/layouts/AdminLayout'

import AnalyticsPage from './page'

export default function AdminAnalytics(): ReactElement {
  return (
    <AdminLayout>
      <AnalyticsPage />
    </AdminLayout>
  )
}

AdminAnalytics.getLayout = function getLayout(
  page: ReactElement
): ReactElement {
  return <AdminLayout>{page}</AdminLayout>
}
